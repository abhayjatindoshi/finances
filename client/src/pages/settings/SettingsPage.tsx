import React, { useEffect } from 'react';
import SettingsList from './SettingsList';
import { Outlet, useLocation } from 'react-router-dom';
import { unsubscribeAll } from '../../utils/ComponentUtils';
import { subscribeTo } from '../../utils/GlobalVariable';

const SettingsPage: React.FC = () => {

  const pageUrl = '/settings';
  const location = useLocation();
  const [isPortrait, setIsPortrait] = React.useState(false);

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(screenSubscription);
  }, []);

  return (
    <div className='flex flex-row'>
      {(!isPortrait || location.pathname === pageUrl) &&
        <div className={isPortrait ? 'flex-1 app-content-height' : 'basis-1/6 app-content-height'}>
          <SettingsList />
        </div>
      }
      {(!isPortrait || location.pathname !== pageUrl) &&
        <div className={isPortrait ? 'flex-1 app-content-height' : 'basis-5/6 app-content-height'}>
          <Outlet />
        </div>
      }
    </div>
  );
};

export default SettingsPage;