import { Avatar } from '@fluentui/react-components';
import React from 'react';
import { antColors } from '../constants';
import { pickRandomByHash } from '../utils/Common';

type AvatarSize = 16 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64 | 72 | 96 | 120 | 128;
interface UserProfileProps {
  name: string;
  profileImage?: string | undefined;
  size?: 'small' | 'medium' | 'large' | AvatarSize;
  color?: string;
}

const sizeMap: Record<string, AvatarSize> = {
  small: 24,
  medium: 40,
  large: 56,
};

const UserProfile: React.FC<UserProfileProps> = ({ name, profileImage, size = 40, color }) => {
  const profileImageError = !profileImage || profileImage === '';
  let avatarSize: AvatarSize = 40;
  if (typeof size === 'string') {
    avatarSize = sizeMap[size] || 40;
  } else if (typeof size === 'number') {
    avatarSize = size as AvatarSize;
  }
  return (
    <Avatar 
      image={!profileImageError ? { src: profileImage } : undefined}
      size={avatarSize}
      style={{ backgroundColor: color ? color : `var(--ant-${pickRandomByHash(name, antColors)})`, border: 0 }}
    >
      {name.charAt(0).toUpperCase()}
    </Avatar>
  );
};

export default UserProfile;