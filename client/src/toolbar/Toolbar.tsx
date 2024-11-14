import { BookOutlined, BugOutlined, DownloadOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
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
      <div className="flex items-center justify-center gap-12 h-12 text-xl">
        <MenuItem icon={<HomeOutlined />} title={t('home')} link="/" hideTitle={isPortrait} />
        <MenuItem icon={<BookOutlined />} title="Accounts" link="/accounts" hideTitle={isPortrait} />
        <MenuItem icon={<DownloadOutlined />} title="Import" link="/import" hideTitle={isPortrait} />
        <MenuItem icon={<SettingOutlined />} title="Settings" link="/settings" hideTitle={isPortrait} />
        <MenuItem icon={<BugOutlined />} title="Test" link="/test" hideTitle={isPortrait} />
      </div>
    </>
  )
}
