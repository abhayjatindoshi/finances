import { DownloadOutlined, LogoutOutlined, SwapOutlined, SyncOutlined } from "@ant-design/icons";
import { Badge, Dropdown, MenuProps } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import UserProfile from "../common/UserProfile";
import { logoutUrl } from "../constants";
import syncManager from "../db/sync-manager";
import { User } from "../services/entities/User";
import { BeforeInstallPromptEvent } from "../utils/BeforeInstallPromptEvent";

interface ProfileProps {
  user: User
}

const Profile: React.FC<ProfileProps> = ({ user }) => {

  const { t } = useTranslation();
  const { tenantId } = useParams();
  const navigate = useNavigate();
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
        label: t('app.sync'),
        icon: <SyncOutlined />,
        key: 'sync',
        onClick: () => {
          if (!tenantId) return;
          syncManager.sync(tenantId, { replacement: true });
        }
      },
      {
        label: t('app.switchHousehold'),
        icon: <SwapOutlined />,
        key: 'switchHousehold',
        onClick: () => navigate('/'),
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
          <UserProfile name={user?.name} profileImage={user?.picture} color="var(--ant-blue)" />
        </Badge>
      </Dropdown>
    </div>
  )
}

export default Profile;