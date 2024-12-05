import { Database, Q } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React, { ReactNode } from 'react';
import Category, { CategoryType } from '../../../db/models/Category';
import { Avatar, List } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Money from '../../../common/Money';
import { useTranslation } from 'react-i18next';
import IconButton from '../../../common/IconButton';
import { PlusOutlined } from '@ant-design/icons';

interface CategorySettingsListProps {
  categories: Array<Category>
}

const CategorySettingsList: React.FC<CategorySettingsListProps> = ({ categories }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const selectedCategoryId = location.pathname.split('/').pop();

  function description(category: Category): ReactNode {
    if (category.monthlyLimit) {
      return <>
        {t('app.monthly')}: <Money amount={category.monthlyLimit} />
      </>
    } else if (category.yearlyLimit) {
      return <>
        {t('app.yearly')}: <Money amount={category.yearlyLimit} />
      </>
    }
    return '';
  }

  function avatarBackground(category: Category): string {
    let backgroundColor = 'var(--ant-blue-5)';
    if (category.type === CategoryType.Income) {
      backgroundColor = 'var(--ant-blue-5)';
    } else if (category.type === CategoryType.Needs) {
      backgroundColor = 'var(--ant-green-5)';
    } else if (category.type === CategoryType.Wants) {
      backgroundColor = 'var(--ant-yellow-5)';
    } else if (category.type === CategoryType.Savings) {
      backgroundColor = 'var(--ant-red-5)';
    }
    return backgroundColor;
  }

  return (
    <div>
      <div className='flex flex-row m-3'>
        <div className='text-xl grow'>{t('app.categories')}</div>
        <IconButton type='primary' icon={<PlusOutlined />} onClick={() => navigate('/settings/budget/new')}>
          {t('app.new')}
        </IconButton>
      </div>
      <List itemLayout='horizontal' dataSource={categories} renderItem={category => (
        <List.Item className='cursor-pointer selection-hover'
          style={{
            backgroundColor: selectedCategoryId === category.id ? 'var(--ant-blue-1)' : '',
            color: selectedCategoryId === category.id ? 'var(--ant-blue-6)' : ''
          }}
          onClick={() => navigate('/settings/budget/' + category.id)}>
          <div className='flex flex-row items-center mx-3'>
            <Avatar size={'large'} shape='square' style={{ backgroundColor: avatarBackground(category) }}>{category.type.charAt(0)}</Avatar>
            <div className='flex flex-col ml-3 gap-1'>
              <div>{category.name}</div>
              <div className='text-xs' style={{
                color: selectedCategoryId === category.id ? 'var(--ant-blue-5)' : 'var(--ant-color-text-tertiary)'
              }}>{description(category)}</div>
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