import { createGlobalVariable } from '../utils/GlobalVariable';
import { loginUrl, profileApiUrl } from '../constants';
import { Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { loadDatabase } from '../db/database';
import { User } from '../services/entities/User';

interface AppLoaderPageProps {
  onLoadingComplete?: () => void;
}

const AppLoaderPage: React.FC<AppLoaderPageProps> = ({ onLoadingComplete }) => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = createGlobalVariable<User>('user');
  const [loadingTip, setLoadingTip] = React.useState<string>('');

  useEffect(() => {

    async function loadCurrentUser(): Promise<void> {
      const userResponse = await fetch(profileApiUrl).then(res => res.json());
      if ((userResponse as { code: string }).code === 'UNAUTHORIZED') {
        window.location.href = loginUrl;
        return;
      }
      user.next(userResponse as User);
    }

    const loginApp = async () => {
      try {
        setLoadingTip(t('app.loggingIn'));
        await loadCurrentUser();
        setLoadingTip(t('app.syncing'));
        await loadDatabase();
        onLoadingComplete?.();
      } catch (error) {
        console.error(error);
        navigate('/error?error=app.failedLogin');
      }
    }
    loginApp();

  }, [navigate, onLoadingComplete, t, user]);

  return (
    <div className='flex flex-col gap-2 h-screen items-center justify-center'>
      <Spin percent="auto" size='large' />
      <div className='text-xl'>{loadingTip}</div>
    </div>
  );
};

export default AppLoaderPage;