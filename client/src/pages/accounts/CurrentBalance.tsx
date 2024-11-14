import React, { useEffect } from 'react';
import Account from '../../db/models/Account';
import { withObservables } from '@nozbe/watermelondb/react';
import { Statistic } from 'antd';
import { getCurrentAccountBalance } from '../../utils/DbUtils';
import { useTranslation } from 'react-i18next';
import Money from '../../common/Money';

interface CurrentBalanceProps {
  account: Account
}

const CurrentBalance: React.FC<CurrentBalanceProps> = ({ account }) => {

  const [balance, setBalance] = React.useState<number | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    if (account) {
      getCurrentAccountBalance(account).then(async (balance) => {
        setBalance(balance);
      });
    }
  }, [account]);

  return (
    <Statistic title={t('app.currentBalance')} className='text-right' loading={balance === undefined} valueRender={() => <Money amount={balance} />} />
  );
};

const enhance = withObservables(['account'], ({ account }) => ({
  account,
}));
const EnhancedCurrentBalance = enhance(CurrentBalance);
export default EnhancedCurrentBalance;