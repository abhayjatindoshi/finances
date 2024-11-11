import { BookOutlined, BugOutlined, DownloadOutlined, HomeOutlined, SettingOutlined } from "@ant-design/icons";
import MenuItem from "./MenuItem";
import { useState, useEffect } from "react";

export default function Toolbar() {

  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const { innerWidth, innerHeight } = window;
      setIsOverflowing(innerWidth < innerHeight);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <>
      <div className="flex items-center justify-center gap-12 h-12 text-xl">
        <MenuItem icon={<HomeOutlined />} title="Home" link="/" hideTitle={isOverflowing} />
        <MenuItem icon={<BookOutlined />} title="Accounts" link="/accounts" hideTitle={isOverflowing} />
        <MenuItem icon={<DownloadOutlined />} title="Import" link="/import" hideTitle={isOverflowing} />
        <MenuItem icon={<SettingOutlined />} title="Settings" link="/settings" hideTitle={isOverflowing} />
        <MenuItem icon={<BugOutlined />} title="Test" link="/test" hideTitle={isOverflowing} />
      </div>
    </>
  )
}
