import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import Category, { CategoryType } from '../../../db/models/Category';
import database from '../../../db/database';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { PlusOutlined } from '@ant-design/icons';

interface BudgetSettingsProps {
  categories: Array<Category>
}

const BudgetSettings: React.FC<BudgetSettingsProps> = ({ categories }) => {

  // const categoryRows = 
  const { t } = useTranslation();
  const categoryTypes = ['', ...Object.values(CategoryType)];

  // const addCategory 

  return (
    <div className='my-2 mx-auto flex flex-col items-center'>
      {categoryTypes.map(category =>
        <div key={category} className='flex flex-row items-end min-w-96 py-2 border-b border-gray-500'>
          {category === '' ?
            <>
              <div className='w-8'></div>
              <div className='text-xl'>{t('app.category')}</div>
              <div className='text-xl'>{t('app.monthly')}</div>
            </> :
            <>
              <div className='text-2xl [writing-mode:vertical-lr] rotate-180 w-8'>{category}</div>
              <div className='flex-1'>
                {categories.filter(c => c.type === category).map(c =>
                  <div key={c.id} className='text-sm flex flex-row gap-1'>
                    <Input className="border-r border-gray-600" size='small' variant='borderless' value={c.name} />
                    <Input className='w-48' size='small' variant='borderless' prefix={t('app.currency')} value={c.monthlyLimit} />
                  </div>)}
                <div onClick={() => console.log} className='cursor-pointer text-gray-700 text-sm'><PlusOutlined /> {t('app.add')}</div>
              </div>
            </>
          }
        </div>
      )}
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  categories: database(tenantId).collections.get<Category>('categories').query(Q.sortBy('name')),
}));
const EnhancedBudgetSettings = () => {
  const { tenantId } = useParams();
  const EnhancedBudgetSettings = enhance(BudgetSettings);
  return <EnhancedBudgetSettings tenantId={tenantId} />;
};
export default EnhancedBudgetSettings;