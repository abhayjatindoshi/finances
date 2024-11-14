import React from 'react';
import Account from '../../db/models/Account';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import { Database, Q } from '@nozbe/watermelondb';
import Transaction from '../../db/models/Transaction';
import { Table } from 'antd';
import Column from 'antd/es/table/Column';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import Money from '../../common/Money';


interface TransactionsListProps {
  account: Account,
  transactions: Array<Transaction>
}

class EntendedTransaction extends Transaction {
  index: number = 0;
  balance: number = 0;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ account, transactions }) => {

  const { t } = useTranslation();
  let prevBalance = account.initialBalance;
  for (let i = transactions.length - 1; i >= 0; i--) {
    const transaction = transactions[i] as EntendedTransaction;
    transaction.index = i + 1;
    transaction.balance = prevBalance + transaction.amount;
    prevBalance = transaction.balance;
  }

  return (
    <div>
      <Table<Transaction> dataSource={transactions} pagination={false} rowKey='id' size='small'>
        <Column title={t('app.id')} dataIndex="index" key="index" />
        <Column title={t('app.subCategory')} dataIndex="subCategoryId" key="subCategoryId" />
        <Column title={t('app.time')} dataIndex="transactionAt" key="transactionAt" render={(transactionAt: Date) => moment(transactionAt).fromNow()} />
        <Column title={t('app.title')} dataIndex="title" key="title" />
        <Column title={t('app.withdraw')} dataIndex="amount" key="withdraw" render={(amount: number) => { return amount < 0 ? <Money amount={(-amount)} /> : '' }} />
        <Column title={t('app.deposit')} dataIndex="amount" key="deposit" render={(amount: number) => { return amount > 0 ? <Money amount={(amount)} /> : '' }} />
        <Column title={t('app.balance')} dataIndex="balance" key="balance" render={(balance: number) => <Money amount={balance} />} />
      </Table>
    </div>
  );
};

const enhance = withObservables(['account'], ({ database, account }: { database: Database, account: Account }) => ({
  account,
  transactions: database.collections.get<Transaction>('transactions').query(Q.where('account_id', account.id), Q.sortBy('transaction_at', 'desc'))
}));
const EnhancedTransactionsList = withDatabase(enhance(TransactionsList));
export default EnhancedTransactionsList;