import { Dropdown, MenuProps } from 'antd';
import React, { useEffect } from 'react';
import Account from '../../db/models/Account';
import { DownOutlined } from '@ant-design/icons';
import { Database, Q } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import TableName from '../../db/TableName';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedCurrentBalance from './CurrentBalance';
import EnhancedTransactionSheet from './TransactionSheet';

interface AccountsPageProps {
  accounts: Array<Account>;
}

const AccountsPage: React.FC<AccountsPageProps> = ({ accounts }) => {

  const navigate = useNavigate();
  const items = accounts.map(account => ({
    key: account.id,
    value: account.id,
    label: account.name
  }));

  const { id } = useParams();
  const [account, setAccount] = React.useState<Account | undefined>();

  useEffect(() => {
    if (id && accounts && accounts.length > 0) {
      const selectedAccount = accounts.find(account => account.id === id);
      if (selectedAccount) {
        setAccount(selectedAccount);
      }
    }
  }, [id, accounts]);

  const onAccountChange: MenuProps['onClick'] = ({ key }) => {
    const selectedAccount = accounts.find(account => account.id === key);
    if (selectedAccount) {
      navigate(`/accounts/${selectedAccount.id}`);
    }
  }

  return (
    <>
      <div className='pt-2 px-2 flex flex-col app-content-height'>
        <div className='flex'>
          <div className='grow'>
            <Dropdown menu={{ items, onClick: onAccountChange }} >
              <div className='text-xl w-96'>
                {account?.name} <DownOutlined />
              </div>
            </Dropdown>
          </div>
          {account ? <EnhancedCurrentBalance account={account} /> : null}
        </div>
        {account ? <div className='grow overflow-auto'><EnhancedTransactionSheet account={account} /></div> : null}
      </div>
    </>
  );
};


const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(Q.sortBy('name'))
}));
const EnhancedAccountsPage = withDatabase(enhance(AccountsPage));
export default EnhancedAccountsPage;