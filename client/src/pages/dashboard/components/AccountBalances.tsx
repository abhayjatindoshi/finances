import React, { useEffect } from 'react';
import Account from '../../../db/models/Account';
import { Database } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import TableName from '../../../db/TableName';
import { List, Typography } from 'antd';
import { getCurrentAccountBalance } from '../../../utils/DbUtils';

interface AccountBalancesProps {
  accounts: Array<Account>;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts }) => {

  const [balanceMap, setBalanceMap] = React.useState<Map<string, number>>(new Map());

  useEffect(() => {
    const fetchBalances = async () => {
      const balances = new Map<string, number>();
      for (let account of accounts) {
        balances.set(account.id, await getCurrentAccountBalance(account));
      }
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts]);

  return (
    <List size='small' dataSource={accounts} renderItem={(account) => (
      <List.Item>
        <div className='flex flex-row items-center w-full'>
          <Typography.Text className='grow text-lg' ellipsis={true}>{account.name}</Typography.Text>
          <div className='text-sm text-nowrap'>₹ {balanceMap.get(account.id)}</div>
        </div>
      </List.Item>
    )} />
  );
};
const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query()
}));
const EnhancedAccountBalances = withDatabase(enhance(AccountBalances));
export default EnhancedAccountBalances;