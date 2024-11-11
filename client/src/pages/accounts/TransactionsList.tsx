import React from 'react';
import Account from '../../db/models/Account';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import { Database, Q } from '@nozbe/watermelondb';
import Transaction from '../../db/models/Transaction';
import { Col, Table } from 'antd';
import Column from 'antd/es/table/Column';
import moment from 'moment';


interface TransactionsListProps {
  account: Account,
  transactions: Array<Transaction>
}

const TransactionsList: React.FC<TransactionsListProps> = ({ account, transactions }) => {

  let prevBalance = account.initialBalance;
  for (let i = transactions.length - 1; i >= 0; i--) {
    let transaction = transactions[i] as any;
    transaction.index = i + 1;
    transaction.balance = parseFloat(prevBalance + transaction.amount).toFixed(2);
    prevBalance = parseFloat(transaction.balance);
  }

  return (
    <div>
      <Table<Transaction> dataSource={transactions} pagination={false} rowKey='id' size='small'>
        <Column title="ID" dataIndex="index" key="index" />
        <Column title="SubCategory" dataIndex="subCategoryId" key="subCategoryId" />
        <Column title="Time" dataIndex="transactionAt" key="transactionAt" render={(transactionAt: Date) => moment(transactionAt).fromNow()} />
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Withdraw" dataIndex="amount" key="withdraw" render={(amount: number) => { return amount < 0 ? (-amount).toFixed(2) : '' }} />
        <Column title="Deposit" dataIndex="amount" key="deposit" render={(amount: number) => { return amount > 0 ? amount.toFixed(2) : '' }} />
        <Column title="Balance" dataIndex="balance" key="balance" />
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