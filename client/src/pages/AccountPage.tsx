import { Database } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import TableName from '../db/TableName';
import Account from '../db/models/Account';

interface AccountPageProps {

}

const AccountPage: React.FC<AccountPageProps> = ({ }) => {
  return (
    <div>
      
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query()
}));

export default withDatabase(enhance(AccountPage));