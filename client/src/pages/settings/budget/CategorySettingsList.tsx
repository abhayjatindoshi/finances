import { Database, Q } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import Category, { CategoryType } from '../../../db/models/Category';
import { Avatar, List } from 'antd';
import { useNavigate } from 'react-router-dom';

interface CategorySettingsListProps {
  categories: Array<Category>
}

const CategorySettingsList: React.FC<CategorySettingsListProps> = ({ categories }) => {

  const navigate = useNavigate();

  function description(category: Category): string {
    if (category.monthlyLimit) {
      return `Monthly: ${category.monthlyLimit}`;
    } else if (category.yearlyLimit) {
      return `Yearly: ${category.yearlyLimit}`;
    }
    return '';
  }

  function avatarBackground(category: Category): string {
    let backgroundColor = 'var(--ant-blue-7)';
    if (category.type === CategoryType.Income) {
      backgroundColor = 'var(--ant-blue-7)';
    } else if (category.type === CategoryType.Needs) {
      backgroundColor = 'var(--ant-green-7)';
    } else if (category.type === CategoryType.Wants) {
      backgroundColor = 'var(--ant-yellow-7)';
    } else if (category.type === CategoryType.Savings) {
      backgroundColor = 'var(--ant-red-7)';
    }
    return backgroundColor;
  }

  return (
    <div>
      <div className='text-xl m-3'>Categories</div>
      <List itemLayout='horizontal' dataSource={categories} renderItem={category => (
        <List.Item className='cursor-pointer hover:bg-slate-900' onClick={() => navigate('/settings/budget/' + category.id)}>
          <div className='flex flex-row items-center mx-3'>
            <Avatar shape='square' style={{ backgroundColor: avatarBackground(category) }}>{category.type.charAt(0)}</Avatar>
            <div className='flex flex-col ml-3'>
              <div>{category.name}</div>
              <div>{description(category)}</div>
            </div>
          </div>
        </List.Item>
      )} />
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  categories: database.collections.get<Category>('categories').query(Q.sortBy('name')),
}));
const EnhancedCategorySettingsList = withDatabase(enhance(CategorySettingsList));
export default EnhancedCategorySettingsList;