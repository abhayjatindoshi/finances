import { Database, Q } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect } from 'react';
import { Avatar, List } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Money from '../../../common/Money';
import { useTranslation } from 'react-i18next';
import IconButton from '../../../common/IconButton';
import { PlusOutlined } from '@ant-design/icons';
import TableName from '../../../db/TableName';
import Account from '../../../db/models/Account';
import { getCurrentAccountBalance } from '../../../utils/DbUtils';

interface AccountsSettingsListProps {
  accounts: Array<Account>
}

const AccountsSettingsList: React.FC<AccountsSettingsListProps> = ({ accounts }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [balanceMap, setBalanceMap] = React.useState<Map<string, number>>(new Map());
  const selectedAccountId = location.pathname.split('/').pop();

  useEffect(() => {
    const fetchBalances = async () => {
      const balances = new Map<string, number>();
      for (const account of accounts) {
        balances.set(account.id, await getCurrentAccountBalance(account));
      }
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts]);

  function randomBackgroundColor(account: Account): string {
    const choices = ['var(--ant-blue-5)', 'var(--ant-green-5)', 'var(--ant-yellow-5)', 'var(--ant-red-5)'];
    const hash = account.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return choices[hash % choices.length];
  }

  return (
    <div>
      <div className='flex flex-row m-3'>
        <div className='text-xl grow'>{t('app.accounts')}</div>
        <IconButton type='primary' icon={<PlusOutlined />} onClick={() => navigate('/settings/accounts/new')}>
          {t('app.new')}
        </IconButton>
      </div>
      <List itemLayout='horizontal' dataSource={accounts} renderItem={account => (
        <List.Item
          className={'cursor-pointer selection-hover'}
          style={{
            backgroundColor: selectedAccountId === account.id ? 'var(--ant-blue-1)' : '',
            color: selectedAccountId === account.id ? 'var(--ant-blue-6)' : ''
          }}
          onClick={() => navigate('/settings/accounts/' + account.id)}>
          <div className='flex flex-row items-center mx-3'>
            <Avatar size={'large'} shape='square' style={{ backgroundColor: randomBackgroundColor(account) }} >{account.name.charAt(0).toUpperCase()}</Avatar>
            <div className='flex flex-col ml-3 gap-1'>
              <div>{account.name}</div>
              <div className='text-xs' style={{
                color: selectedAccountId === account.id ? 'var(--ant-blue-5)' : 'var(--ant-color-text-tertiary)'
              }}>{t('app.balance')}: <Money amount={balanceMap.get(account.id)} /></div>
            </div>
          </div>
        </List.Item>
      )} />
    </div>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
}));
const EnhancedCategorySettingsList = withDatabase(enhance(AccountsSettingsList));
export default EnhancedCategorySettingsList;