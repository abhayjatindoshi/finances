import { createGlobalVariable } from '../utils/GlobalVariable';
import { loginUrl, profileApiUrl } from '../constants';
import { Button, Spin } from 'antd';
import { sync } from '../db/sync';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { BeforeInstallPromptEvent } from '../utils/BeforeInstallPromptEvent';

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
  const [showInstallButton, setInstallButton] = React.useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const loginApp = async () => {
      setLoadingTip(t('app.loggingIn'));
      await fetch(profileApiUrl)
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
    }

    const checkAppInstalled = async () => {
      return new Promise<void>((resolve) => {
        if (window.matchMedia('(display-mode: standalone)').matches) {
          resolve();
        } else if ('BeforeInstallPromptEvent' in window) {
          window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
            e.preventDefault();
            setInstallPrompt(e);
            setInstallButton(true);
          });
        } else {
          resolve();
        }
      });
    }

    checkAppInstalled()
      .then(() => loginApp());

  }, [navigate, onLoadingComplete, t, user]);

  async function InstallApp() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallButton(false);
      setInstallPrompt(null);
      window.location.reload();
    }
  }

  return (
    <div className='flex flex-col gap-2 h-screen items-center justify-center'>
      {showInstallButton ?
        <Button type='primary' onClick={() => InstallApp()}>{t('app.installApp')}</Button> : <>
          <Spin percent="auto" size='large' />
          <div className='text-xl'>{loadingTip}</div>
        </>
      }
    </div>
  );
};

export default AppLoaderPage;