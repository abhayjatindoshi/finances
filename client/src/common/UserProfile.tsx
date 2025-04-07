import { Avatar } from 'antd';
import { AvatarSize } from 'antd/es/avatar/AvatarContext';
import React from 'react';
import { antColors } from '../constants';
import { pickRandomByHash } from '../utils/Common';

interface UserProfileProps {
  name: string;
  profileImage?: string | undefined;
  size?: AvatarSize
  color?: string
}

const UserProfile: React.FC<UserProfileProps> = ({ name, profileImage, size = 'default', color }) => {
  const [profileImageError, setProfileImageError] = React.useState<boolean>(!profileImage || profileImage === '');
  return (
    <Avatar src={!profileImageError &&
      <img src={profileImage} alt="avatar" onError={() => setProfileImageError(true)} />
    } size={size} style={{ backgroundColor: color ? color : `var(--ant-${pickRandomByHash(name, antColors)})`, border: 0 }}>{name.charAt(0).toUpperCase()}</Avatar>
  );
};

export default UserProfile;