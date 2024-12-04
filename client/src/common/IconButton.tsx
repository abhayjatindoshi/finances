import { Button } from 'antd';
import { ButtonColorType, ButtonType } from 'antd/es/button';
import React, { MouseEventHandler, ReactNode, useEffect, useState } from 'react';
import { subscribeTo } from '../utils/GlobalVariable';
import { unsubscribeAll } from '../utils/ComponentUtils';

interface IconButtonProps {
  type?: ButtonType;
  size?: 'small' | 'middle' | 'large';
  color?: ButtonColorType;
  danger?: boolean;
  icon: ReactNode;
  loading?: boolean;
  formAction?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler | undefined
  children: ReactNode
}

const IconButton: React.FC<IconButtonProps> = ({ type, size, color, danger, icon, loading, formAction, disabled, onClick, children }) => {

  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const subscription = subscribeTo('isScreenLandscape', setShowContent);

    return unsubscribeAll(subscription);
  }, []);

  return (
    <Button
      type={type}
      size={size}
      color={color}
      danger={danger}
      icon={icon}
      loading={loading}
      formAction={formAction}
      disabled={disabled}
      onClick={onClick}>
      {showContent && children}
    </Button>
  );
};

export default IconButton;