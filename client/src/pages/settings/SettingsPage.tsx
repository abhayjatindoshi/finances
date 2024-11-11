import React, { useEffect } from 'react';
import SettingsList from './SettingsList';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (location.pathname === '/settings') {
      navigate('/settings/account');
    }
  }, [location.pathname]);

  return (
    <div className='flex flex-row'>
      <div className='basis-1/5 app-content-height'>
        <SettingsList />
      </div>
      <div className='flex-grow app-content-height'>
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsPage;