import React from 'react';
import Account from '../../../db/models/Account';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import EnhancedAccountCard from './AccountCard';
import { Database } from '@nozbe/watermelondb';
import TableName from '../../../db/TableName';

interface AccountCardsBlockProps {
  accounts: Array<Account>;
}

const AccountCardsBlock: React.FC<AccountCardsBlockProps> = ({ accounts }) => {
  return (
    <div className='flex flex-row flex-wrap gap-4'>
      {accounts.map(account => (
        <EnhancedAccountCard account={account} balances={{ 'a1': 99234.213 }} key={account.id} />
      ))}
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query()
}));
const EnhancedAccountCardsBlock = withDatabase(enhance(AccountCardsBlock));
export default EnhancedAccountCardsBlock;