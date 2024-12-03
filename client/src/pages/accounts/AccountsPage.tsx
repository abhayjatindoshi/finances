import { Drawer, Dropdown, MenuProps } from 'antd';
import React, { useEffect } from 'react';
import Account from '../../db/models/Account';
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Database, Q } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import TableName from '../../db/TableName';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedCurrentBalance from './CurrentBalance';
import EnhancedTransactionsList from './TransactionsList';
import IconButton from '../../common/IconButton';
import { useTranslation } from 'react-i18next';
import ImportPage from './import/ImportPage';

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

  const { t } = useTranslation();
  const { id } = useParams();
  const [account, setAccount] = React.useState<Account | undefined>();
  const [importDrawerOpen, setImportDrawerOpen] = React.useState<boolean>(false);

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
        <div className='flex items-center gap-6'>
          <div className='grow'>
            <Dropdown menu={{ items, onClick: onAccountChange }} >
              <div className='text-xl w-96'>
                {account?.name} <DownOutlined />
              </div>
            </Dropdown>
          </div>
          <div className='flex flex-col gap-2'>
            <IconButton icon={<PlusOutlined />} onClick={() => setImportDrawerOpen(true)}>{t('app.import')}</IconButton>
            <IconButton icon={<PlusOutlined />} disabled>{t('app.add')}</IconButton>
          </div>
          {account && <EnhancedCurrentBalance account={account} />}
        </div>
        {account && <div className='grow overflow-auto'><EnhancedTransactionsList account={account} /></div>}
      </div>
      <Drawer title={t('app.import')} closable={false} size='large' placement='right' onClose={() => setImportDrawerOpen(false)} open={importDrawerOpen}>
        {account && <ImportPage account={account} onClose={() => setImportDrawerOpen(false)} />}
      </Drawer>
    </>
  );
};


const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(Q.sortBy('name'))
}));
const EnhancedAccountsPage = withDatabase(enhance(AccountsPage));
export default EnhancedAccountsPage;