import { Badge, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from "@fluentui/react-components";
import { ArrowDownloadRegular, ArrowSwapRegular, MicSyncRegular, SignOutRegular } from "@fluentui/react-icons";
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

  return (
    <div className="flex items-center h-full cursor-pointer">
      <Menu>
        <MenuTrigger>
          <Badge appearance={installPrompt ? "filled" : "ghost"}>
            <UserProfile name={user?.name} profileImage={user?.picture} size={32} color="var(--ant-blue)" />
        </Badge>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {installPrompt && (
              <MenuItem 
                icon={<ArrowDownloadRegular />}
                onClick={() => {
                  installPrompt.prompt();
                }}
              >
                {t('app.installApp')}
              </MenuItem>
            )}
            <MenuItem 
              icon={<MicSyncRegular />}
              onClick={() => {
                if (!tenantId) return;
                syncManager.sync(tenantId, { replacement: true });
              }}
            >
              {t('app.sync')}
            </MenuItem>
            <MenuItem 
              icon={<ArrowSwapRegular />}
              onClick={() => navigate('/')}
            >
              {t('app.switchHousehold')}
            </MenuItem>
            <MenuItem 
              icon={<SignOutRegular />}
              onClick={() => {
                window.location.href = logoutUrl
              }}
            >
              {t('app.logout')}
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  )
}

export default Profile;