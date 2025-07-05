import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import Loading from '../common/Loading';
import { loginUrl } from '../constants';
import syncManager from '../db/sync-manager';
import { User } from '../services/entities/User';
import userService from '../services/user-service';
import { createGlobalVariable } from '../utils/GlobalVariable';

const App: React.FC = () => {

  const { t } = useTranslation();
  const { tenantId } = useParams();
  const userSubject = createGlobalVariable<User>('user');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [loadingTip, setLoadingTip] = React.useState<string>('');
  const navigate = useNavigate();

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

    async function loadApp() {
      setLoading(true);
      setLoadingTip(t('app.loggingIn'));
      await loadUser()
      setLoadingTip('');
      setLoading(false);
      syncManager.startAutoSync();
    }

    loadApp();

  }, [t, userSubject]);

  useEffect(() => {
    if (!tenantId && !loading) {
      navigate('/tenants');
    }
  }, [tenantId, loading, navigate]);

  return <>
    {loading && <Loading loadingTip={loadingTip} />}
    {!loading && <Outlet />}
  </>;
};

export default App;