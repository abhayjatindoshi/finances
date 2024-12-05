import { BankOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import MenuItem from "./MenuItem";
import { useState, useEffect } from "react";
import { subscribeTo } from "../utils/GlobalVariable";
import { unsubscribeAll } from "../utils/ComponentUtils";
import { useTranslation } from "react-i18next";

export default function Toolbar() {
  const { t } = useTranslation();
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const subscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(subscription);
  }, []);

  return (
    <>
      <div className="flex items-end justify-center gap-12 h-12 text-xl">
        <MenuItem icon={<HomeOutlined />} title={t('app.home')} link="/dashboard" hideTitle={isPortrait} />
        <MenuItem icon={<BankOutlined />} title={t('app.accounts')} link="/accounts" hideTitle={isPortrait} />
        <MenuItem icon={<SettingOutlined />} title={t('app.settings')} link="/settings" hideTitle={isPortrait} />
      </div>
    </>
  )
}
