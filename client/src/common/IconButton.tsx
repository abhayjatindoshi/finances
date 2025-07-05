import { Button, ButtonProps, Tooltip } from '@fluentui/react-components';
import React, { ReactNode, useEffect, useState } from 'react';
import { unsubscribeAll } from '../utils/ComponentUtils';
import { subscribeTo } from '../utils/GlobalVariable';

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
      <Tooltip content={props.tooltip} relationship="label">
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