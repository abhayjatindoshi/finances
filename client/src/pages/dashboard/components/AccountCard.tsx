import React from 'react';
import Account from '../../../db/models/Account';
import { Card } from 'antd';
import { Link } from 'react-router-dom';
import { withObservables } from '@nozbe/watermelondb/react';

interface AccountCardProps {
  account: Account;
  balances: { [key: string]: number };
}

const AccountCard: React.FC<AccountCardProps> = ({ account, balances }) => {

  let balance = '[Loading...]';
  if (balances && account?.id && balances[account.id]) {
    balance = `₹ ${balances[account.id]}`;
  }

  return (
    <Link to={"accounts/" + account.id}> 
      <Card title={account.name} loading={false} className='w-64' hoverable>
        <span className='text-2xl'>{balance}</span>
      </Card>
    </Link>
  );
};

const enhance = withObservables(['account'], ({ account }) => ({
  account,
}));
const EnhancedAccountCard = enhance(AccountCard);
export default EnhancedAccountCard;