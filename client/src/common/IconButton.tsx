import { Button } from 'antd';
import { ButtonColorType, ButtonType } from 'antd/es/button';
import React, { MouseEventHandler, ReactNode, useEffect, useState } from 'react';
import { subscribeTo } from '../utils/GlobalVariable';
import { unsubscribeAll } from '../utils/ComponentUtils';

interface IconButtonProps {
  type?: ButtonType;
  color?: ButtonColorType;
  danger?: boolean;
  icon: ReactNode;
  loading?: boolean;
  formAction?: string;
  onClick?: MouseEventHandler | undefined
  children: ReactNode
}

const BudgetSettingsPage: React.FC<IconButtonProps> = ({ type, color, danger, icon, loading, formAction, onClick, children }) => {

  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const subscription = subscribeTo('isScreenLandscape', setShowContent);

    return unsubscribeAll(subscription);
  }, []);

  return (
    <Button
      type={type}
      color={color}
      danger={danger}
      icon={icon}
      loading={loading}
      formAction={formAction}
      onClick={onClick}>
      {showContent && children}
    </Button>
  );
};

export default BudgetSettingsPage;