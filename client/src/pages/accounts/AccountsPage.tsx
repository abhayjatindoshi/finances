import TransactionSheet from '../../common/transaction-sheet/TransactionSheet';
import Tranasction from '../../db/models/Transaction';
import TableName from '../../db/TableName';
import React from 'react';
import Money from '../../common/Money';
import ImportPage from './import/ImportPage';
import IconButton from '../../common/IconButton';
import EnhancedTransactionsList from './TransactionsList';
import Account from '../../db/models/Account';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForceUpdate } from '../../utils/ComponentUtils';
import { AliwangwangOutlined, DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Database, Q } from '@nozbe/watermelondb';
import { Drawer, Dropdown, MenuProps, Statistic } from 'antd';

interface AccountsPageProps {
  accounts: Array<Account>;
  allTransactions: Array<Tranasction>;
}

const AccountsPage: React.FC<AccountsPageProps> = ({ accounts, allTransactions }) => {

  const navigate = useNavigate();
  const items = accounts.map(account => ({
    key: account.id,
    value: account.id,
    label: account.name
  }));

  const { t } = useTranslation();
  const { id } = useParams();
  const forceUpdate = useForceUpdate();
  const [importDrawerOpen, setImportDrawerOpen] = React.useState<boolean>(false);
  const [newUi, setNewUi] = React.useState(true);

  const onAccountChange: MenuProps['onClick'] = ({ key }) => {
    const selectedAccount = accounts.find(account => account.id === key);
    if (selectedAccount) {
      navigate(`/accounts/${selectedAccount.id}`);
    }
  }

  const account = accounts.find(account => account.id === id);
  const balance = allTransactions.filter(transaction => transaction.account.id === id).reduce((acc, transaction) => acc + transaction.amount, account?.initialBalance || 0);

  return (
    <>
      <div className='pt-2 px-2 flex flex-col app-content-height'>
        <div className='flex items-center gap-6'>
          <div className='grow'>
            <Dropdown menu={{ items, onClick: onAccountChange }} >
              <div className='text-xl w-96'>
                {account?.name} <DownOutlined />
              </div>
            </Dropdown>
          </div>
          <div className='flex flex-col items-center'>
            <IconButton icon={<AliwangwangOutlined />} type={newUi ? 'default' : 'primary'} onClick={() => setNewUi(!newUi)}>{newUi ? 'Old UI' : 'New UI'}</IconButton>
          </div>
          <div className='flex flex-col gap-2'>
            <IconButton icon={<PlusOutlined />} onClick={() => setImportDrawerOpen(true)}>{t('app.import')}</IconButton>
            <IconButton icon={<PlusOutlined />} disabled>{t('app.add')}</IconButton>
          </div>
          {account && <Statistic title={t('app.currentBalance')} className='text-right' loading={balance === undefined} valueRender={() => <Money amount={balance} />} />}
        </div>
        {account &&
          <div className='grow overflow-auto'>
            {newUi ?
              <TransactionSheet account={account} refresh={forceUpdate} /> :
              <EnhancedTransactionsList account={account} />
            }
          </div>
        }
      </div>
      <Drawer title={t('app.import')} closable={false} size='large' placement='right' onClose={() => setImportDrawerOpen(false)} open={importDrawerOpen}>
        {account && <ImportPage account={account} onClose={() => setImportDrawerOpen(false)} />}
      </Drawer>
    </>
  );
};


const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
  allTransactions: database.collections.get<Tranasction>(TableName.Transactions).query(Q.sortBy('transactionAt', 'desc'))
}));
const EnhancedAccountsPage = withDatabase(enhance(AccountsPage));
export default EnhancedAccountsPage;