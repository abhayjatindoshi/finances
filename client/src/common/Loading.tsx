import { Spinner } from '@fluentui/react-components';
import React from 'react';

interface LoadingProps {
  loadingTip: string;
}

const Loading: React.FC<LoadingProps> = ({ loadingTip }) => {

  return (
    <div className='absolute h-screen w-screen flex flex-col gap-2 items-center justify-center'>
      <Spinner size="large" />
      <div className='text-xl'>{loadingTip}</div>
    </div>
  );
};

export default Loading;