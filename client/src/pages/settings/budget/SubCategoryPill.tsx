import React, { useEffect } from 'react';
import SubCategory from '../../../db/models/SubCategory';
import { CloseCircleOutlined, DeleteOutlined, EditOutlined, EnterOutlined, PlusOutlined } from '@ant-design/icons';
import database from '../../../db/database';
import { Input, Popconfirm } from 'antd';
import { useTranslation } from 'react-i18next';
import TableName from '../../../db/TableName';
import Category from '../../../db/models/Category';
import Tranasction from '../../../db/models/Transaction';
import { Q } from '@nozbe/watermelondb';

interface SubCategoryPillProps {
  categoryId: string;
  subCategory?: SubCategory | undefined;
}

const SubCategoryPill: React.FC<SubCategoryPillProps> = ({ categoryId, subCategory }) => {

  const { t } = useTranslation();
  const [name, setName] = React.useState(subCategory?.name ?? '');
  const [edit, setEdit] = React.useState(false);
  const [totalDependencyCount, setTotalDependencyCount] = React.useState<number>(0);

  useEffect(() => {
    if (!subCategory) return;
    database.collections.get<Tranasction>(TableName.Transactions)
      .query(Q.where('sub_category_id', subCategory.id)).fetchCount()
      .then(setTotalDependencyCount);

  }, [subCategory]);

  async function save() {
    if (subCategory) {
      await database.write(async () => {
        await subCategory?.update(s => {
          s.name = name;
        })
      });
    } else {
      await database.write(async () => {
        const category = await database.collections.get<Category>(TableName.Categories).find(categoryId);
        const subCategory = await database.collections.get<SubCategory>(TableName.SubCategories);
        await subCategory.create(s => {
          s.name = name;
          s.category.set(category);
        });
      });
    }
    setEdit(false);
  }

  async function deleteSubCategory() {
    if (totalDependencyCount > 0) return;
    await database.write(async () => {
      await subCategory?.markAsDeleted();
    });
  }

  return (
    <div className='flex flex-row p-2 rounded-lg w-64 h-12 cursor-pointer shadow hover:shadow-lg group' style={{ backgroundColor: "var(--ant-color-bg-container)" }}>
      <div className='grow'>
        {edit && <Input type='text' autoFocus value={name} onChange={e => setName(e.target.value)} onBlur={() => setEdit(false)} onPressEnter={() => save()} />}
        {subCategory && !edit && subCategory.name}
        {!subCategory && !edit && <div className='flex flex-row h-full gap-2 items-center' onClick={() => setEdit(true)}>
          <PlusOutlined />
          <div>{t('app.new')} {t('app.subCategory')}</div>
        </div>}
      </div>
      <div className='flex gap-2'>
        {edit && <EnterOutlined onClick={() => save()} />}
        {subCategory && !edit &&
          <>
            <EditOutlined className='invisible group-hover:visible' onClick={() => setEdit(true)} />
            <Popconfirm
              title={`${t('app.delete')} ${t('app.subCategory')} ?`}
              icon={<CloseCircleOutlined style={{ color: 'red' }} />}
              description={<>
                {totalDependencyCount > 0 ?
                  <div className='text-red-500'>{t('app.cannotDelete', { count: totalDependencyCount, entity: t('app.subCategory').toLowerCase() })}</div> :
                  t('app.deleteConfirmation', { entity: t('app.subCategory') })
                }
              </>}
              onConfirm={deleteSubCategory}
              placement='leftBottom'
              okText={t('app.yes')}
              okButtonProps={{ disabled: totalDependencyCount > 0 }}
              cancelText={t('app.no')}>
              <DeleteOutlined className='invisible group-hover:visible' />
            </Popconfirm>
          </>
        }
      </div>
    </div>
  );
};

export default SubCategoryPill;