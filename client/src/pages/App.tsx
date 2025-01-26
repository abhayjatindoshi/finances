import React, { useEffect } from 'react';
import { createGlobalVariable } from '../utils/GlobalVariable';
import { User } from '../services/entities/User';
import userService from '../services/user-service';
import { loginUrl } from '../constants';
import { Tenant } from '../services/entities/Tenant';
import tenantService from '../services/tenant-service';
import Loading from '../common/Loading';
import { useTranslation } from 'react-i18next';
import TenantsPage from './TenantsPage';
import { Outlet, useParams } from 'react-router-dom';
import syncManager from '../db/sync-manager';

const App: React.FC = () => {

  const { t } = useTranslation();
  const { tenantId } = useParams();
  const userSubject = createGlobalVariable<User>('user');
  const [tenants, setTenants] = React.useState<Tenant[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingTip, setLoadingTip] = React.useState<string>('');

  useEffect(() => {
    async function loadUser() {
      const user = await userService.loadCurrentUser()
      if (!user) {
        window.location.href = loginUrl;
        throw new Error('User not logged in');
      } else {
        userSubject.next(user);
      }
    }

    async function loadTenants() {
      const tenants = await tenantService.fetchAllTenants();
      setTenants(tenants);
    }

    async function loadApp() {
      setLoading(true);
      setLoadingTip(t('app.loggingIn'));
      await loadUser()
      setLoadingTip(t('app.loadingTenants'));
      await loadTenants()
      setLoadingTip('');
      setLoading(false);
      syncManager.startAutoSync();
    }

    loadApp();

  }, [t, userSubject]);

  return <>
    {loading && <Loading loadingTip={loadingTip} />}
    {!loading && !tenantId && <TenantsPage tenants={tenants} />}
    {!loading && tenantId && <Outlet />}
  </>;
};

export default App;