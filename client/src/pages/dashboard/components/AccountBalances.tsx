import { SwapOutlined } from '@ant-design/icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { Card, Statistic, Tooltip, Typography } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { antColors, dateTimeFormat, moneyFormat } from '../../../constants';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import TableName from '../../../db/TableName';
import { pickRandomByHash } from '../../../utils/Common';
import { AccountBalance, getBalanceMap } from '../../../utils/DbUtils';

interface AccountBalancesProps {
  accounts: Array<Account>;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts }) => {

  const { Text } = Typography;
  const { tenantId } = useParams();
  const { t } = useTranslation();
  const [balanceMap, setBalanceMap] = React.useState<Map<Account, AccountBalance>>(new Map());

  useEffect(() => {
    const fetchBalances = async () => {
      if (!tenantId) return;
      const balances = await getBalanceMap(tenantId);
      setBalanceMap(balances);
    };
    fetchBalances();
  }, [accounts, tenantId]);

  function AccountCard({ account }: { account: Account }) {
    const [hover, setHover] = React.useState(false);
    const backgroundColor = `var(--ant-${pickRandomByHash(account.name, antColors)}-4)`;
    const hoverColor = `var(--ant-${pickRandomByHash(account.name, antColors)}-6)`;

    return <Link to={`/tenants/${tenantId}/transactions/${account.id}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Card key={account.id} style={{ backgroundColor: hover ? hoverColor : backgroundColor, transition: 'background-color 0.2s' }} hoverable={true}>
        <Statistic className='w-36' title={<Tooltip title={account.name}><Text ellipsis={true}>{account.name}</Text></Tooltip>}
          value={moneyFormat.format(balanceMap.get(account)?.balance ?? 0)} />
        <div className='flex flex-row items-start justify-between' style={{ color: 'var(--ant-color-text-description)' }}>
          <span className='text-xs'>
            <Tooltip title={dateTimeFormat.format(balanceMap.get(account)?.lastUpdate)}>
              {moment(balanceMap.get(account)?.lastUpdate).fromNow(true)} {t('app.ago')}
            </Tooltip>
          </span>
          <span className='text-xs'>
            <SwapOutlined /> {balanceMap.get(account)?.transactionCount}
          </span>
        </div>
      </Card>
    </Link>
  }

  return (
    <div className='rounded-lg p-2 w-96' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <div className='text-xl font-semibold mb-2'>{t('app.currentBalance')}</div>
      <div className='flex flex-wrap gap-2 items-center justify-center'>
        {accounts.map(account => <AccountCard key={account.id} account={account} />)}
      </div>
    </div>
  );
};
const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(Q.sortBy('name'))
}));
const EnhancedAccountBalances = () => {
  const { tenantId } = useParams();
  const EnhancedAccountBalances = enhance(AccountBalances);
  return <EnhancedAccountBalances tenantId={tenantId} />;
};
export default EnhancedAccountBalances;