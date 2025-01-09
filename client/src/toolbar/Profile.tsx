import { Dropdown, Avatar, MenuProps, Badge } from "antd";
import React, { useEffect, useState } from "react";
import { User } from "../pages/AppLoaderPage";
import { useTranslation } from "react-i18next";
import { logoutUrl } from "../constants";
import { DownloadOutlined, LogoutOutlined } from "@ant-design/icons";
import { BeforeInstallPromptEvent } from "../utils/BeforeInstallPromptEvent";

interface ProfileProps {
  user: User
}

const Profile: React.FC<ProfileProps> = ({ user }) => {

  const { t } = useTranslation();
  const [profileImageError, setProfileImageError] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const checkInstallCapability = async () => {
      if ('BeforeInstallPromptEvent' in window) {
        window.addEventListener('beforeinstallprompt', (e: BeforeInstallPromptEvent) => {
          e.preventDefault();
          setInstallPrompt(e);
        });
      }
    }

    checkInstallCapability();
  }, []);

  const profileOptions: MenuProps = {
    items: [
      installPrompt && {
        label: <Badge dot style={{ lineHeight: 'var(--ant-line-height)' }}>{t('app.installApp')}</Badge>,
        icon: <DownloadOutlined />,
        key: 'installApp',
        onClick: () => {
          installPrompt.prompt();
        }
      },
      {
        label: t('app.logout'),
        icon: <LogoutOutlined />,
        key: 'logout',
        onClick: () => {
          window.location.href = logoutUrl
        }
      }
    ]
  }

  return (
    <div className="flex items-center h-full cursor-pointer">
      <Dropdown trigger={['click']} menu={profileOptions}>
        <Badge dot={installPrompt != null}>
          <Avatar src={!profileImageError &&
            <img src={user?.picture} alt="avatar" onError={() => setProfileImageError(true)} />
          } size="default" style={{ backgroundColor: 'var(--ant-blue)' }}>{user?.name.charAt(0)}</Avatar>
        </Badge>
      </Dropdown>
    </div>
  )
}

export default Profile;