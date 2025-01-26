import { HomeOutlined, PieChartOutlined, SettingOutlined, SwapOutlined } from "@ant-design/icons";
import { subscribeTo } from "../utils/GlobalVariable";
import { unsubscribeAll } from "../utils/ComponentUtils";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import MenuItem from "./MenuItem";
import Profile from "./Profile";
import { User } from "../services/entities/User";

export default function Toolbar() {
  const { t } = useTranslation();
  const [isPortrait, setIsPortrait] = useState(false);
  const [user, setUser] = useState<User | undefined>();

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    const userSubscription = subscribeTo('user', (u) => setUser(u as User));
    return unsubscribeAll(screenSubscription, userSubscription);
  }, []);

  return (
    <>
      <div className="flex justify-center gap-12 text-xl" style={{ height: 'var(--ant-layout-header-height)' }}>
        <MenuItem icon={<HomeOutlined />} title={t('app.home')} link="dashboard" hideTitle={isPortrait} />
        <MenuItem icon={<SwapOutlined />} title={t('app.transactions')} link="transactions" hideTitle={isPortrait} />
        <MenuItem icon={<PieChartOutlined />} title={t('app.budget')} link="budget" hideTitle={isPortrait} />
        <MenuItem icon={<SettingOutlined />} title={t('app.settings')} link="settings" hideTitle={isPortrait} />
        {user && <Profile user={user} />}
      </div>
    </>
  )
}
