import { createGlobalVariable } from '../utils/GlobalVariable';
import { loginUrl, profileApiUrl } from '../constants';
import { Spin } from 'antd';
import { sync } from '../db/sync';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AppLoaderPageProps {
  onLoadingComplete?: () => void;
}

const AppLoaderPage: React.FC<AppLoaderPageProps> = ({ onLoadingComplete }) => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = createGlobalVariable<User>('user');
  const [loadingTip, setLoadingTip] = React.useState<string>('');

  useEffect(() => {
    setLoadingTip(t('app.loggingIn'));
    fetch(profileApiUrl)
      .then(res => res.json())
      .then((data: { code: string } | User) => {
        if ((data as { code: string }).code === 'UNAUTHORIZED') {
          window.location.href = loginUrl;
          return;
        }

        user.next(data as User);
        setLoadingTip(t('app.syncing'));

        sync().then(() => {
          onLoadingComplete?.();
        });

      })
      .catch(() => {
        navigate('/error?error=app.failedLogin');
      });

  }, [navigate, onLoadingComplete, t, user]);

  return (
    <div className='flex flex-col gap-2 h-screen items-center justify-center'>
      <Spin percent="auto" size='large' />
      <div className='text-xl'>{loadingTip}</div>
    </div>
  );
};

export default AppLoaderPage;