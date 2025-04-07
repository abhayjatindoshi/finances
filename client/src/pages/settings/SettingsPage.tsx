import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { unsubscribeAll } from '../../utils/ComponentUtils';
import { subscribeTo } from '../../utils/GlobalVariable';
import SettingsList from './SettingsList';

const SettingsPage: React.FC = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const pageUrl = `/tenants/${tenantId}/settings`;
  const [isPortrait, setIsPortrait] = React.useState(true);

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(screenSubscription);
  }, [isPortrait, location.pathname, navigate]);

  if (!isPortrait && location.pathname === pageUrl) {
    navigate(`/tenants/${tenantId}/settings/accounts`);
  }

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