import React from 'react';
import EnhancedCategorySettingsList from './CategorySettingsList';
import { Outlet } from 'react-router-dom';

const BudgetSettingsPage: React.FC = () => {

  return (
    <div className='flex'>
      <div className='w-96 app-content-height border-e' style={{borderColor: 'var(--ant-color-split)'}}>
        <EnhancedCategorySettingsList />
      </div>
      <div className='flex-1 app-content-height'>
        <Outlet key="budget-settings-outlet" />
      </div>
    </div>
  );
};

export default BudgetSettingsPage;