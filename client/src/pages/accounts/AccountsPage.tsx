import TransactionSheet from '../../common/transaction-sheet/TransactionSheet';
import Tranasction from '../../db/models/Transaction';
import TableName from '../../db/TableName';
import React from 'react';
import Money from '../../common/Money';
import ImportPage from './import/ImportPage';
import IconButton from '../../common/IconButton';
import Account from '../../db/models/Account';
import { withObservables } from '@nozbe/watermelondb/react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForceUpdate } from '../../utils/ComponentUtils';
import { CloseCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined } from '@ant-design/icons';
import { Q } from '@nozbe/watermelondb';
import { Drawer, Dropdown, MenuProps, Popconfirm, Statistic } from 'antd';
import database from '../../db/database';

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
  const [selectedTransactionIds, setSelectedTransactionIds] = React.useState<string[]>([])

  const onAccountChange: MenuProps['onClick'] = ({ key }) => {
    const selectedAccount = accounts.find(account => account.id === key);
    if (selectedAccount) {
      navigate(`/accounts/${selectedAccount.id}`);
    }
  }

  const deleteTransactions = async () => {
    await database().write(async () => {
      const transactions = selectedTransactionIds
        .map(id => allTransactions.find(t => t.id === id))
      transactions.forEach(t => t?.markAsDeleted());
    });
  }

  const account = accounts.find(account => account.id === id);
  const balance = allTransactions.filter(transaction => transaction.account.id === id).reduce((acc, transaction) => acc + transaction.amount, account?.initialBalance || 0);

  return (
    <>
      <div className='pt-2 px-2 flex flex-col app-content-height'>
        <div className='flex items-center gap-2'>
          <div className='grow'>
            <div className='max-w-64'>
              <Dropdown menu={{ items, onClick: onAccountChange }} >
                <div className='text-xl'>
                  {account?.name} <DownOutlined />
                </div>
              </Dropdown>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <IconButton icon={<DownloadOutlined />} onClick={() => setImportDrawerOpen(true)}>{t('app.import')}</IconButton>
            {/* <IconButton icon={<PlusOutlined />} disabled>{t('app.add')}</IconButton> */}
            {selectedTransactionIds.length > 0 &&
              <Popconfirm
                title={`${t('app.delete')} ${t('app.transactions')} ?`}
                icon={<CloseCircleOutlined style={{ color: 'red' }} />}
                description={`${t('app.deleteConfirmation', { entity: t('app.transactions') })}`}
                onConfirm={deleteTransactions}
                placement='leftBottom'
                okText={t('app.yes')}
                cancelText={t('app.no')}>
                <IconButton icon={<DeleteOutlined />} danger>{t('app.delete')}</IconButton>
              </Popconfirm>
            }
          </div>
          {account && <Statistic title={t('app.currentBalance')} className='min-w-16 text-right' loading={balance === undefined} valueRender={() => <Money amount={balance} />} />}
        </div>
        {account &&
          <div className='grow overflow-auto'>
            <TransactionSheet account={account} refresh={forceUpdate} setSelectedTransactions={setSelectedTransactionIds} />
          </div>
        }
      </div>
      <Drawer title={t('app.import')} closable={true} size='large' placement='right' onClose={() => setImportDrawerOpen(false)} open={importDrawerOpen}>
        {account && <ImportPage account={account} onClose={() => setImportDrawerOpen(false)} />}
      </Drawer>
    </>
  );
};


const enhance = withObservables([], () => ({
  accounts: database().collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
  allTransactions: database().collections.get<Tranasction>(TableName.Transactions).query(Q.sortBy('transactionAt', 'desc'))
}));
const EnhancedAccountsPage = enhance(AccountsPage);
export default EnhancedAccountsPage;