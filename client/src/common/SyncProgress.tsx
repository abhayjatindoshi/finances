import { LinearProgress } from '@mui/material';
import React from 'react';
import { unsubscribeAll } from '../utils/ComponentUtils';
import { subscribeTo } from '../utils/GlobalVariable';

const SyncProgress: React.FC = () => {

  const [syncing, setSyncing] = React.useState<boolean>(false);

  React.useEffect(() => {
    const syncSubscription = subscribeTo('syncing', b => setSyncing(b as boolean));
    return unsubscribeAll(syncSubscription);
  }, []);

  return (
    <>
      {syncing && <LinearProgress className="rounded w-full top-0 left-0 right-0" />}
    </>
  );
};

export default SyncProgress;