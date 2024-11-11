import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React, { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Category from '../../../db/models/Category';
import { Database } from '@nozbe/watermelondb';
import TableName from '../../../db/TableName';
import { Button, Dropdown, Input, Popconfirm, Segmented, Select, Space } from 'antd';
import { CloseCircleOutlined, DeleteOutlined, DownOutlined, EditOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import database from '../../../db/database';

interface CategorySettingsProps {
  categories: Array<Category>
}

const CategorySettings: React.FC<CategorySettingsProps> = ({ categories }) => {

  const { categoryId } = useParams();
  const [category, setCategory] = React.useState<Category | undefined>();
  const [editTitle, setEditTitle] = React.useState(false);

  useEffect(() => {
    let category = categories?.find(category => category.id === categoryId);
    setCategory(category);
  }, [categoryId]);

  function deleteCategory() {
    // category?.delete();
  }

  function updateName(name: string) {
    if (!category) return;
    database.write(async () => {
      category.update((category) => {
        category.name = name;
      });
    });
  }

  function budgetLimitTypeValue(category: Category | undefined) {
    if (category?.yearlyLimit ?? 0 > 0) {
      return 'yearly';
    } else {
      return 'monthly';
    }
  }

  function budgetLimitValue(category: Category | undefined) {
    if (!category) return 0;
    if (category.yearlyLimit > 0) {
      return category.yearlyLimit;
    } else if (category.monthlyLimit > 0) {
      return category.monthlyLimit;
    }
    return 0;
  }

  function Title() {
    if (editTitle) {
      return <Input size='large' variant='borderless' defaultValue={category?.name}
        onChange={(event) => updateName(event.target.value)}
        onBlur={() => setEditTitle(false)} />
    } else {
      return <>
        {category?.name}
        <EditOutlined className="cursor-pointer" onClick={() => setEditTitle(true)} />
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
      <Button danger><DeleteOutlined /></Button>
    </Popconfirm>
  }

  function BudgetLimitType() {
    return <Select value={budgetLimitTypeValue(category)}
      className='w-24' options={[
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' }
      ]} onChange={async (value) => {
        if (!category) return;
        await database.write(async () => {
          setCategory(undefined);
          let updated = await category.update((category) => {
            if (value === 'monthly') {
              category.monthlyLimit = budgetLimitValue(category);
              category.yearlyLimit = 0;
            } else {
              category.yearlyLimit = budgetLimitValue(category);
              category.monthlyLimit = 0;
            }
          });
          setCategory(updated);
        });
      }} />
  }

  function BudgetLimit() {
    return <Input type="number" prefix='₹' className='w-24' defaultValue={budgetLimitValue(category)} />
  }

  function CategoryType() {
    return <Segmented<string> options={['Needs', 'Wants', 'Savings', 'Income']} />
  }

  return (
    <div className="flex flex-col gap-4 m-3">
      <div className="flex items-center">
        <div className="text-xl grow">
          <Title />
        </div>
        <div>
          <Delete />
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
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  categories: database.collections.get<Category>(TableName.Categories).query(),
}));
const EnhancedCategorySettings = withDatabase(enhance(CategorySettings));
export default EnhancedCategorySettings;