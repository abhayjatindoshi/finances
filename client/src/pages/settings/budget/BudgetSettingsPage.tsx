import React, { useEffect } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import { unsubscribeAll } from '../../../utils/ComponentUtils';
import { subscribeTo } from '../../../utils/GlobalVariable';
import CategorySettingsList from './CategorySettingsList';

const BudgetSettingsPage: React.FC = () => {

  const { tenantId } = useParams();
  const pageUrl = `/tenants/${tenantId}/settings/budget`;
  const location = useLocation();
  const [isPortrait, setIsPortrait] = React.useState<boolean>(false);
  const listClass = isPortrait ? 'w-full' : 'w-96';

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(screenSubscription);
  }, []);

  return (
    <div className='flex'>
      {(!isPortrait || location.pathname === pageUrl) &&
        <div className={`${listClass} app-content-height border-e`} style={{ borderColor: 'var(--ant-color-split)' }}>
          <CategorySettingsList />
        </div>
      }
      {(!isPortrait || location.pathname !== pageUrl) &&
        <div className='flex-1 app-content-height'>
          <Outlet key="budget-settings-outlet" />
        </div>
      }
    </div>
  );
};

export default BudgetSettingsPage;