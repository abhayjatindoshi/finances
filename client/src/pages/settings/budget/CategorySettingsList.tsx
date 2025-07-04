import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { Avatar, List } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconButton from '../../../common/IconButton';
import Money from '../../../common/Money';
import { antColors } from '../../../constants';
import database from '../../../db/database';
import Category from '../../../db/models/Category';
import { pickRandomByHash } from '../../../utils/Common';
import { unsubscribeAll } from '../../../utils/ComponentUtils';
import { subscribeTo } from '../../../utils/GlobalVariable';

interface CategorySettingsListProps {
  categories: Array<Category>
}

const CategorySettingsList: React.FC<CategorySettingsListProps> = ({ categories }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { tenantId } = useParams();
  const { t } = useTranslation();
  const selectedCategoryId = location.pathname.split('/').pop();
  const [isPortrait, setIsPortrait] = React.useState<boolean>(false);

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(screenSubscription);
  }, []);

  return (
    <div className='flex flex-col app-content-height'>
      <div className='flex flex-row items-center m-2'>
        {isPortrait && <LeftOutlined className='mr-1' onClick={() => navigate(`/tenants/${tenantId}/settings`)} />}
        <div className='text-xl grow'>{t('app.categories')}</div>
        <IconButton type='primary' icon={<PlusOutlined />} onClick={() => navigate(`/tenants/${tenantId}/settings/budget/new`)}>
          {t('app.new')}
        </IconButton>
      </div>
      <List className='overflow-auto' itemLayout='horizontal' dataSource={categories} renderItem={category => (
        <List.Item className='cursor-pointer selection-hover'
          style={{
            backgroundColor: selectedCategoryId === category.id ? 'var(--ant-blue-1)' : '',
            color: selectedCategoryId === category.id ? 'var(--ant-blue-6)' : ''
          }}
          onClick={() => navigate(`/tenants/${tenantId}/settings/budget/${category.id}`)}>
          <div className='flex flex-row items-center mx-3 gap-2 w-full'>
            <Avatar size={'default'} shape='square' style={{ backgroundColor: `var(--ant-${pickRandomByHash(category.name, antColors)}-6)` }}>{category.name.charAt(0)}</Avatar>
            <div className='flex-1'>{category.name}</div>
            <div style={{color: selectedCategoryId === category.id ? 'var(--ant-blue-5)' : 'var(--ant-color-text-tertiary)'}}>
              <Money amount={category.monthlyLimit * 12 + category.yearlyLimit} />
            </div>
          </div>
        </List.Item>
      )} />
      <div className='flex flex-row items-center m-2'>
        <div className='text-xl grow'>{t('app.total') + ' ' + t('app.budget')}</div>
        <div className='text-xl'>
          <Money amount={categories.reduce((sum, c) => sum + (c.monthlyLimit * 12 + c.yearlyLimit), 0)} />
        </div>
      </div>
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  categories: database(tenantId).collections.get<Category>('categories').query(Q.sortBy('name')),
}));
const EnhancedCategorySettingsList = () => {
  const { tenantId } = useParams();
  const EnhancedCategorySettingsList = enhance(CategorySettingsList);
  return <EnhancedCategorySettingsList tenantId={tenantId} />;
};

export default EnhancedCategorySettingsList;