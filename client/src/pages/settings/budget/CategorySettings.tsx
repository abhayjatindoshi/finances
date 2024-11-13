import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Category, { CategoryType, CategoryType as EnumCategoryType } from '../../../db/models/Category';
import { Database } from '@nozbe/watermelondb';
import TableName from '../../../db/TableName';
import { Input, Popconfirm, Segmented, Select, Tag } from 'antd';
import { CloseCircleOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import IconButton from '../../../common/IconButton';
import SubCategory from '../../../db/models/SubCategory';
import database from '../../../db/database';

interface CategorySettingsProps {
  categories: Array<Category>
  allSubCategories: Array<SubCategory>
}

interface RawCategory {
  name: string;
  limit: number;
  limitType: 'monthly' | 'yearly';
  type: CategoryType;
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ categories, allSubCategories }) => {

  const { categoryId } = useParams();
  const [category, setCategory] = useState<RawCategory>({ name: '', limit: 0, limitType: 'monthly', type: EnumCategoryType.Needs });
  const [ subCategories, setSubCategories ] = useState<SubCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    let category = categories?.find(category => category.id === categoryId);
    if (category) {
      setCategory({
        name: category.name,
        limit: category.monthlyLimit > 0 ? category.monthlyLimit : category.yearlyLimit,
        limitType: category.monthlyLimit > 0 ? 'monthly' : 'yearly',
        type: category.type
      })
    }

    let subCategories = allSubCategories?.filter(subCategory => subCategory.category.id === categoryId);
    if (subCategories) {
      setSubCategories(subCategories);
    }

  }, [categoryId, categories]);

  function deleteCategory() {
    // TODO: Implement delete category
  }

  async function saveCategory() {
    setSaving(true);
    let dbCategory = categories.find(category => category.id === categoryId);
    if (!dbCategory) return;
    await database.write(async () => {
      await dbCategory!.update((c) => {
        c.name = category.name;
        c.monthlyLimit = category.limitType === 'monthly' ? category.limit : 0;
        c.yearlyLimit = category.limitType === 'yearly' ? category.limit : 0;
        c.type = category.type;
      })
    });
    setSaving(false);
  }

  function Title() {
    if (edit) {
      return <Input defaultValue={category.name}
        onChange={(event) => category.name = event.target.value} />
    } else {
      return <>
        {category.name}
      </>
    }
  }

  function Options() {
    if (edit) {
      return <>
        <IconButton type="primary" icon={<SaveOutlined />} onClick={async () => {
          await saveCategory();
          setEdit(false)
        }}>Save</IconButton>
        <IconButton icon={<CloseCircleOutlined />} onClick={() => setEdit(false)}>Cancel</IconButton>
      </>
    } else {
      return <>
        <IconButton icon={<EditOutlined />} onClick={() => setEdit(true)}>Edit</IconButton>
        <Delete />
      </>
    }
  }

  function Delete() {
    return <Popconfirm
      title={`Delete category ?`}
      icon={<CloseCircleOutlined style={{ color: 'red' }} />}
      description="Are you sure to delete this category ?"
      onConfirm={deleteCategory}
      placement='leftBottom'
      okText="Yes"
      cancelText="No">
      <IconButton danger icon={<DeleteOutlined />}>Delete</IconButton>
    </Popconfirm>
  }

  function BudgetLimitType() {
    return <Select disabled={!edit} value={category.limitType}
      className='w-24' options={[
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
      ]} onChange={(value) => {
        category.limitType = value;
      }} />
  }

  function BudgetLimit() {
    return <Input disabled={!edit} type="number" prefix='₹' className='w-24' defaultValue={category.limit} />
  }

  function CategoryType() {
    return <Segmented<string> disabled={!edit} value={category.type} options={['Needs', 'Wants', 'Savings', 'Income']} />
  }

  return (
    <div className="flex flex-col gap-4 m-3">
      <div className="flex items-center gap-2">
        <div className="text-xl grow">
          <Title />
        </div>
        <div className='flex flex-row items-center gap-2'>
          <Options />
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <div>Budget limit</div>
        <div className='flex gap-2 items-center'>
          <BudgetLimitType />
          <BudgetLimit />
        </div>
      </div>
      <div>
        <CategoryType />
      </div>
      <div>
        <div className='text-lg'>Sub Categories</div>
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