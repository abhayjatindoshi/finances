import { Database, Q } from '@nozbe/watermelondb';
import { AccountBalance, getBalanceMap } from '../../../utils/DbUtils';
import { List, Tooltip, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import Account from '../../../db/models/Account';
import Money from '../../../common/Money';
import React, { useEffect } from 'react';
import TableName from '../../../db/TableName';
import moment from 'moment';
import { dateTimeFormat } from '../../../constants';
import { Link } from 'react-router-dom';

interface AccountBalancesProps {
  accounts: Array<Account>;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts }) => {

  const { t } = useTranslation();
  const [balanceMap, setBalanceMap] = React.useState<Map<Account, AccountBalance>>(new Map());

  useEffect(() => {
    const fetchBalances = async () => {
      const balances = await getBalanceMap();
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts]);

  return (
    <div className='rounded-lg p-2 w-96' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <div className='text-xl font-semibold mb-2'>{t('app.currentBalance')}</div>
      <div className='overflow-auto'>
        <List size='small' dataSource={accounts} renderItem={(account) => (
          <List.Item className='flex flex-row items-start justify-between w-full gap-5'>
            <div className='flex flex-col'>
              <Link to={'/transactions/' + account.id}>
                <Typography.Text className='grow text-xl' ellipsis={true}>{account.name}</Typography.Text>
              </Link>
              <div className='flex flex-row items-center gap-2'>
                <span className='text-xs'>
                  <Tooltip title={dateTimeFormat.format(balanceMap.get(account)?.lastUpdate)}>
                    {moment(balanceMap.get(account)?.lastUpdate).fromNow(true)} {t('app.ago')}
                  </Tooltip>
                </span>
                <span>•</span>
                <span className='text-xs'>
                  {balanceMap.get(account)?.transactionCount} {t('app.transactions')}
                </span>
              </div>
            </div>
            <div className='text-nowrap'><Money amount={balanceMap.get(account)?.balance} /></div>
          </List.Item>
        )} />
      </div>
    </div>
  );
};
const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(Q.sortBy('name'))
}));
const EnhancedAccountBalances = withDatabase(enhance(AccountBalances));
export default EnhancedAccountBalances;