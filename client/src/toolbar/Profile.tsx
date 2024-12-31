import { Dropdown, Avatar, MenuProps } from "antd";
import React, { useState } from "react";
import { User } from "../pages/AppLoaderPage";
import { useTranslation } from "react-i18next";
import { logoutUrl } from "../constants";

interface ProfileProps {
  user: User
}

const Profile: React.FC<ProfileProps> = ({ user }) => {

  const { t } = useTranslation();
  const [profileImageError, setProfileImageError] = useState<boolean>(false);


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
    <div className="flex items-center h-full cursor-pointer">
      <Dropdown trigger={['click']} menu={profileOptions}>
        <Avatar src={!profileImageError &&
          <img src={user?.picture} alt="avatar" onError={() => setProfileImageError(true)} />
        } size="default" style={{ backgroundColor: 'var(--ant-blue)' }}>{user?.name.charAt(0)}</Avatar>
      </Dropdown>
    </div>
  )
}

export default Profile;