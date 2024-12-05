import { Button, Tooltip } from 'antd';
import { ButtonProps } from 'antd/es/button';
import React, { ReactNode, useEffect, useState } from 'react';
import { subscribeTo } from '../utils/GlobalVariable';
import { unsubscribeAll } from '../utils/ComponentUtils';

type IconButtonProps = ButtonProps & {
  icon: ReactNode,
  tooltip?: string
}

const IconButton: React.FC<IconButtonProps> = (props: IconButtonProps) => {

  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    const subscription = subscribeTo('isScreenLandscape', setShowContent);

    return unsubscribeAll(subscription);
  }, []);

  if (props.tooltip) {
    return (
      <Tooltip title={props.tooltip}>
        <Button {...props}>
          {showContent && props.children}
        </Button>
      </Tooltip>
    );
  } else {
    return (
      <Button {...props}>
        {showContent && props.children}
      </Button>
    );
  }
};

export default IconButton;