import { BankOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import MenuItem from "./MenuItem";
import { useState, useEffect } from "react";
import { subscribeTo } from "../utils/GlobalVariable";
import { unsubscribeAll } from "../utils/ComponentUtils";
import { useTranslation } from "react-i18next";
import { User } from "../pages/AppLoaderPage";
import { Avatar, Dropdown, MenuProps } from "antd";
import { logoutUrl } from "../constants";

export default function Toolbar() {
  const { t } = useTranslation();
  const [isPortrait, setIsPortrait] = useState(false);
  const [user, setUser] = useState<User | undefined>();
  const [profileImageError, setProfileImageError] = useState<boolean>(false);

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    const userSubscription = subscribeTo('user', (u) => setUser(u as User));
    return unsubscribeAll(screenSubscription, userSubscription);
  }, []);

  const profileOptions: MenuProps = {
    items: [
      {
        label: t('app.logout'),
        key: 'logout',
        onClick: () => {
          window.location.href = logoutUrl
        }
      }
    ]
  }

  return (
    <>
      <div className="flex justify-center gap-12 text-xl" style={{ height: 'var(--ant-layout-header-height)' }}>
        <MenuItem icon={<HomeOutlined />} title={t('app.home')} link="/dashboard" hideTitle={isPortrait} />
        <MenuItem icon={<BankOutlined />} title={t('app.accounts')} link="/accounts" hideTitle={isPortrait} />
        <MenuItem icon={<SettingOutlined />} title={t('app.settings')} link="/settings" hideTitle={isPortrait} />
        <div className="flex items-center h-full cursor-pointer">
          <Dropdown trigger={['click']} menu={profileOptions}>
            <Avatar src={!profileImageError &&
              <img src={user?.picture} alt="avatar" onError={() => setProfileImageError(true)} />
            } size="default" style={{ backgroundColor: 'var(--ant-blue)' }}>{user?.name.charAt(0)}</Avatar>
          </Dropdown>
        </div>
      </div>
    </>
  )
}
