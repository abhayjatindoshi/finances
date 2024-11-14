import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Category, { CategoryType, CategoryType as EnumCategoryType } from '../../../db/models/Category';
import { Database } from '@nozbe/watermelondb';
import TableName from '../../../db/TableName';
import { Input, Popconfirm, Segmented, Select, Tag } from 'antd';
import { CloseCircleOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import IconButton from '../../../common/IconButton';
import SubCategory from '../../../db/models/SubCategory';
import database from '../../../db/database';
import { useTranslation } from 'react-i18next';

interface CategorySettingsProps {
  categories: Array<Category>
  allSubCategories: Array<SubCategory>
}

interface RawCategory {
  name: string;
  limit: number;
  limitType: 'monthly' | 'yearly';
  type: string;
}

const defaultCategory: RawCategory = { name: '', limit: 0, limitType: 'monthly', type: EnumCategoryType.Needs };

const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, allSubCategories }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [category, setCategory] = useState<RawCategory>(defaultCategory);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {

    if (categoryId === 'new') {
      setEdit(true);
      setCategory(defaultCategory);
      return;
    }

    const category = categories?.find(category => category.id === categoryId);
    if (!category) {
      navigate('/settings/budget');
      return;
    }

    setCategory({
      name: category.name,
      limit: category.monthlyLimit > 0 ? category.monthlyLimit : category.yearlyLimit,
      limitType: category.monthlyLimit > 0 ? 'monthly' : 'yearly',
      type: category.type
    })

    const subCategories = allSubCategories?.filter(subCategory => subCategory.category.id === categoryId);
    setSubCategories(subCategories);

  }, [categoryId, categories, allSubCategories, navigate]);

  function deleteCategory() {
    database.write(async () => {
      const dbCategory = categories.find(category => category.id === categoryId);
      if (!dbCategory) return;
      await dbCategory.destroyPermanently();
      navigate('/settings/budget');
    });
  }

  function setToCategory(raw: RawCategory, category: Category) {
    category.name = raw.name;
    category.monthlyLimit = raw.limitType === 'monthly' ? raw.limit : 0;
    category.yearlyLimit = raw.limitType === 'yearly' ? raw.limit : 0;
    category.type = CategoryType[raw.type as keyof typeof CategoryType];
  }

  async function saveCategory() {
    setSaving(true);
    if (categoryId === 'new') {
      await database.write(async () => {
        const created = await database.collections.get<Category>(TableName.Categories)
          .create(c => setToCategory(category, c));
        navigate(`/settings/budget/${created.id}`);
      });
    } else {
      const dbCategory = categories.find(category => category.id === categoryId);
      if (!dbCategory) return;
      await database.write(async () => {
        await dbCategory.update(c => setToCategory(category, c));
      });
    }
    setSaving(false);
    setEdit(false);
  }

  function cancelEditing() {
    setEdit(false);
    if (categoryId === 'new') {
      navigate('/settings/budget');
    }
  }

  function Type() {
    return <Segmented<string> disabled={!edit} value={category.type} options={[
      t('app.needs'), t('app.wants'), t('app.savings'), t('app.income')]}
      onChange={selected => setCategory({ ...category, type: selected })} />
  }

  return (
    <div className="flex flex-col gap-4 m-3" key="a">
      <div className="flex items-center gap-2">
        <div className="text-xl grow">
          {edit ?
            <Input value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} /> :
            category.name
          }
        </div>
        <div className='flex flex-row items-center gap-2'>
          {edit ?
            <>
              <IconButton type="primary" loading={saving} icon={<SaveOutlined />} onClick={saveCategory}>{t('app.save')}</IconButton>
              <IconButton icon={<CloseCircleOutlined />} onClick={() => cancelEditing()}>{t('app.cancel')}</IconButton>
            </> :
            <>
              <IconButton icon={<EditOutlined />} onClick={() => setEdit(true)}>{t('app.edit')}</IconButton>
              <Popconfirm
                title={`${t('app.delete')} ${t('app.category')} ?`}
                icon={<CloseCircleOutlined style={{ color: 'red' }} />}
                description={`${t('app.deleteConfirmation', { entity: t('app.category') })}`}
                onConfirm={deleteCategory}
                placement='leftBottom'
                okText={t('app.yes')}
                cancelText={t('app.no')}>
                <IconButton danger icon={<DeleteOutlined />}>{t('app.delete')}</IconButton>
              </Popconfirm>
            </>
          }
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div>{t('app.budgetLimit')}</div>
        <div className='flex gap-2 items-center'>
          <Select disabled={!edit} value={category.limitType}
            onChange={value => setCategory({ ...category, limitType: value })}
            className='w-24' options={[
              { value: 'monthly', label: t('app.monthly') },
              { value: 'yearly', label: t('app.yearly') }
            ]} />
          <Input disabled={!edit} type="number" prefix={t('app.currency')} className='w-24'
            value={category.limit} onChange={e => setCategory({ ...category, limit: parseFloat(e.target.value) })} />
        </div>
      </div>
      <div>
        <Type />
      </div>
      <div>
        <div className='text-lg'>{t('app.subCategories')}</div>
        <div className='flex flex-row flex-wrap gap-2'>
          {subCategories.map(subCategory => (
            <Tag className='text-sm' key={subCategory.id} closable onClose={() => { }}>
              {subCategory.name}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  categories: database.collections.get<Category>(TableName.Categories).query(),
  allSubCategories: database.collections.get<SubCategory>(TableName.SubCategories).query()
}));
const EnhancedCategorySettings = withDatabase(enhance(CategorySettings));
export default EnhancedCategorySettings;