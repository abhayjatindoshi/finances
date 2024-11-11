import React, { useEffect } from 'react';
import Account from '../../db/models/Account';
import { withObservables } from '@nozbe/watermelondb/react';
import { Statistic } from 'antd';
import { getCurrentAccountBalance } from '../../utils/DbUtils';

interface CurrentBalanceProps {
  account: Account
}

const CurrentBalance: React.FC<CurrentBalanceProps> = ({ account }) => {

  const [balance, setBalance] = React.useState<number | undefined>();

  useEffect(() => {
    if (account) {
      getCurrentAccountBalance(account).then((balance) => {
        setBalance(balance);
      });
    }
  }, [account]);

  return (
    <Statistic title='Current Balance' className='text-right' loading={balance == undefined} value={balance} prefix="₹" />
  );
};

const enhance = withObservables(['account'], ({ account }) => ({
  account,
}));
const EnhancedCurrentBalance = enhance(CurrentBalance);
export default EnhancedCurrentBalance;