import React from 'react';
import { Outlet } from 'react-router-dom';
import AccountsSettingsList from './AccountsSettingsList';

const AccountsSettingsPage: React.FC = () => {

  return (
    <div className='flex'>
      <div className='w-96 app-content-height border-e' style={{borderColor: 'var(--ant-color-split)'}}>
        <AccountsSettingsList />
      </div>
      <div className='flex-1 app-content-height'>
        <Outlet key="account-settings-outlet" />
      </div>
    </div>
  );
};

export default AccountsSettingsPage;