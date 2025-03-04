import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect } from 'react';
import { Avatar, List } from 'antd';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Money from '../../../common/Money';
import { useTranslation } from 'react-i18next';
import IconButton from '../../../common/IconButton';
import { LeftOutlined, PlusOutlined } from '@ant-design/icons';
import TableName from '../../../db/TableName';
import Account from '../../../db/models/Account';
import { AccountBalance, getBalanceMap } from '../../../utils/DbUtils';
import { unsubscribeAll } from '../../../utils/ComponentUtils';
import { subscribeTo } from '../../../utils/GlobalVariable';
import { pickRandomByHash } from '../../../utils/Common';
import { antColors } from '../../../constants';
import database from '../../../db/database';

interface AccountsSettingsListProps {
  accounts: Array<Account>
}

const AccountsSettingsList: React.FC<AccountsSettingsListProps> = ({ accounts }) => {

  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { tenantId } = useParams();
  const [balanceMap, setBalanceMap] = React.useState<Map<Account, AccountBalance>>(new Map());
  const selectedAccountId = location.pathname.split('/').pop();
  const [isPortrait, setIsPortrait] = React.useState<boolean>(false);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!tenantId) return;
      const balances = await getBalanceMap(tenantId);
      setBalanceMap(balances);
    };
    fetchBalances();
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(screenSubscription);
  }, [accounts, tenantId]);

  return (
    <div className='flex flex-col app-content-height'>
      <div className='flex flex-row m-2'>
        {isPortrait && <LeftOutlined className='mr-1' onClick={() => navigate(`/tenants/${tenantId}/settings`)} />}
        <div className='text-xl grow'>{t('app.accounts')}</div>
        <IconButton type='primary' icon={<PlusOutlined />} onClick={() => navigate(`/tenants/${tenantId}/settings/accounts/new`)}>
          {t('app.new')}
        </IconButton>
      </div>
      <List className='overflow-auto' itemLayout='horizontal' dataSource={accounts} renderItem={account => (
        <List.Item
          className={'cursor-pointer selection-hover'}
          style={{
            backgroundColor: selectedAccountId === account.id ? 'var(--ant-blue-1)' : '',
            color: selectedAccountId === account.id ? 'var(--ant-blue-6)' : ''
          }}
          onClick={() => navigate(`/tenants/${tenantId}/settings/accounts/${account.id}`)}>
          <div className='flex flex-row items-center mx-3'>
            <Avatar size={'large'} shape='square' style={{ backgroundColor: `var(--ant-${pickRandomByHash(account.name, antColors)}-6)` }} >{account.name.charAt(0).toUpperCase()}</Avatar>
            <div className='flex flex-col ml-3 gap-1'>
              <div>{account.name}</div>
              <div className='text-xs' style={{
                color: selectedAccountId === account.id ? 'var(--ant-blue-5)' : 'var(--ant-color-text-tertiary)'
              }}>{t('app.balance')}: <Money amount={balanceMap.get(account)?.balance} /></div>
            </div>
          </div>
        </List.Item>
      )} />
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(Q.sortBy('name')),
}));
const EnhancedCategorySettingsList = () => {
  const { tenantId } = useParams();
  const EnhancedCategorySettingsList = enhance(AccountsSettingsList);
  return <EnhancedCategorySettingsList tenantId={tenantId} />;
};
export default EnhancedCategorySettingsList;