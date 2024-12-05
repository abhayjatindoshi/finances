import { CloseCircleOutlined, DeleteOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Input, Popconfirm } from 'antd';
import { Q, Database } from '@nozbe/watermelondb';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import database from '../../../db/database';
import IconButton from '../../../common/IconButton';
import React, { useEffect, useState } from 'react';
import TableName from '../../../db/TableName';
import Tranasction from '../../../db/models/Transaction';
import Account from '../../../db/models/Account';

interface AccountSettingsProps {
  accounts: Array<Account>
}

interface RawAccount {
  id: string;
  name: string;
  initialBalance: number;
}

const defaultAccount: RawAccount = { id: '', name: '', initialBalance: 0, };

const AccountSettings: React.FC<AccountSettingsProps> = ({ accounts }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [account, setAccount] = useState<RawAccount>(defaultAccount);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [totalDependencyCount, setTotalDependencyCount] = useState<number>(0);

  useEffect(() => {

    if (accountId === 'new') {
      setEdit(true);
      setAccount(defaultAccount);
      return;
    }

    const account = accounts?.find(account => account.id === accountId);
    if (!account) {
      navigate('/settings/accounts');
      return;
    }

    setAccount({
      id: account.id,
      name: account.name,
      initialBalance: account.initialBalance,
    })

    database.collections.get<Tranasction>(TableName.Transactions)
      .query(Q.where('account_id', account.id))
      .fetchCount().then(setTotalDependencyCount);

  }, [accountId, accounts, navigate]);

  function deleteAccount() {
    if (totalDependencyCount > 0) return;
    database.write(async () => {
      const dbAccount = accounts.find(account => account.id === accountId);
      if (!dbAccount) return;
      await dbAccount.destroyPermanently();
      navigate('/settings/accounts');
    });
  }

  function setToAccount(raw: RawAccount, account: Account) {
    account.name = raw.name;
    account.initialBalance = raw.initialBalance;
  }

  async function saveAccount() {
    setSaving(true);
    if (accountId === 'new') {
      await database.write(async () => {
        const created = await database.collections.get<Account>(TableName.Accounts)
          .create(a => setToAccount(account, a));
        navigate(`/settings/accounts/${created.id}`);
      });
    } else {
      const dbAccount = accounts.find(account => account.id === accountId);
      if (!dbAccount) return;
      await database.write(async () => {
        await dbAccount.update(a => setToAccount(account, a));
      });
    }
    setSaving(false);
    setEdit(false);
  }

  function cancelEditing() {
    setEdit(false);
    if (accountId === 'new') {
      navigate('/settings/accounts');
    }
  }

  return (
    <div className="flex flex-col gap-4 m-3" key="a">
      <div className="flex items-center gap-2">
        <div className="text-xl grow">
          {edit ?
            <Input value={account.name} onChange={e => setAccount({ ...account, name: e.target.value })} /> :
            account.name
          }
        </div>
        <div className='flex flex-row items-center gap-2'>
          {edit ?
            <>
              <IconButton type="primary" loading={saving} icon={<SaveOutlined />} onClick={saveAccount}>{t('app.save')}</IconButton>
              <IconButton icon={<CloseCircleOutlined />} onClick={() => cancelEditing()}>{t('app.cancel')}</IconButton>
            </> :
            <>
              <IconButton icon={<EditOutlined />} onClick={() => setEdit(true)}>{t('app.edit')}</IconButton>
              <Popconfirm
                title={`${t('app.delete')} ${t('app.account')} ?`}
                icon={<CloseCircleOutlined style={{ color: 'red' }} />}
                description={`${t('app.deleteConfirmation', { entity: t('app.account') })}`}
                onConfirm={deleteAccount}
                placement='leftBottom'
                okText={t('app.yes')}
                okButtonProps={{ disabled: totalDependencyCount > 0 }}
                cancelText={t('app.no')}>
                <IconButton danger icon={<DeleteOutlined />}
                  disabled={totalDependencyCount > 0}
                  tooltip={totalDependencyCount > 0 ? t('app.cannotDelete', { entity: t('app.account').toLowerCase(), count: totalDependencyCount }) : ''}>
                  {t('app.delete')}
                </IconButton>
              </Popconfirm>
            </>
          }
        </div>
      </div>
      <div className='flex flex-row gap-2'>
        <div>{t('app.initialBalance')}</div>
        <div className='flex gap-2 items-center'>
          <Input type='number' prefix={t('app.currency')}
            className='w-24' disabled={!edit}
            value={account.initialBalance}
            onChange={e => setAccount({ ...account, initialBalance: parseFloat(e.target.value) })} />
        </div>
      </div>
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
}));
const EnhancedAccountSettings = withDatabase(enhance(AccountSettings));
export default EnhancedAccountSettings;