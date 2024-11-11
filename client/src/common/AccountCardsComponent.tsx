import React, { useEffect, useState } from 'react'
import { Account, AccountsApi } from '../generated';
import { Card } from 'antd';
import { Link } from 'react-router-dom';

export default function AccountCardsComponent() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balances, setBalances] = useState<any>(null);

  useEffect(() => {
    new AccountsApi().getAccounts().subscribe(accounts => {
      setAccounts(accounts);
    })
    new AccountsApi().getAccountBalances().subscribe(balances => {
      setBalances(balances);
    })
  }, [])

  const Account: React.FC<{ account: Account }> = ({ account }) => {
    return <Link to={"accounts/" + account.id}>
      <Card title={account.name} loading={false} className='w-96' hoverable>
        <span className='text-2xl'><pre>₹ {balances && account?.id ? balances[account.id.toString()] : '[Loading...]'}</pre></span>
      </Card>
    </Link>
  }

  return (
    <div className='flex flex-row flex-wrap gap-4'>
      {accounts.map(account => <Account account={account} />)}
    </div>
  )
}
