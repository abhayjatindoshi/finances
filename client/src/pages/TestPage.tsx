import { FC } from 'react'
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import { Database } from '@nozbe/watermelondb';
import { Button } from 'antd';
import database from '../db/database';
import { sync } from '../db/sync';
import TableName from '../db/TableName';
import Account from '../db/models/Account';
import EnhancedAccountCard from './dashboard/components/AccountCard';

interface InputProps {
  accounts: Array<Account>
}

const TestPage: FC<InputProps> = ({ accounts }) => {

  async function createNew() {
    database.write(async () => {
      const account = await database.get<Account>(TableName.Accounts).create(a => {
        a.name = 'testing'
      })
      return account;
    })
    await sync();
  }

  return <>
    <div>TestPage</div>
    <div className='flex flex-row flex-wrap gap-4'>
      {accounts.map((account: any) => <EnhancedAccountCard key={account.id} account={account} balances={{ 'a1': 99234.213 }} />)}
    </div>
    {accounts.map((account: Account) => <div key={account.id}>
      <span>{account.id}</span>-
      <span>{account.name}</span>-
      <span>{account.initialBalance}</span>
      <br />
    </div>)}
    <Button type='primary' onClick={() => createNew()}>New</Button >
  </>
}

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query()
}));
const EnhancedTestPage = withDatabase(enhance(TestPage));
export default EnhancedTestPage;