import React from 'react';
import EnhancedCategorySettingsList from './CategorySettingsList';
import { Outlet } from 'react-router-dom';

const BudgetSettingsPage: React.FC = () => {

  return (
    <div className='flex'>
      <div className='flex-1 app-content-height'>
        <EnhancedCategorySettingsList />
      </div>
      <div className='flex-1 app-content-height'>
        <Outlet />
      </div>
    </div>
  );
};

export default BudgetSettingsPage;