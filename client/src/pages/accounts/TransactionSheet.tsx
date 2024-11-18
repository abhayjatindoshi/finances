import { Database, Q } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import { Table, TableProps } from 'antd';
import React from 'react';
import Account from '../../db/models/Account';
import SubCategory from '../../db/models/SubCategory';
import Transaction from '../../db/models/Transaction';
import EditableCell from '../../common/EditableCell';

interface TransactionSheetProps {
  account: Account,
  dbTransactions: Array<Transaction>
}

class ExtendedTransaction extends Transaction {
  index = 0;
  balance = 0;
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ account, dbTransactions }) => {

  let prevBalance = account.initialBalance;
  const transactions = dbTransactions.map((dbTransaction, index) => {
    const transaction = dbTransaction as ExtendedTransaction;
    transaction.index = index + 1;
    transaction.balance = prevBalance + transaction.amount;
    prevBalance = transaction.balance;
    return transaction;
  });

  const columns: TableProps<ExtendedTransaction>['columns'] = [
  ];


  return (
    <div>
      <Table<ExtendedTransaction>
        components={{ body: { cell: EditableCell } }}
        dataSource={transactions}
        columns={columns}
        rowKey="id"
        bordered />
    </div>
  );
};

const enhance = withObservables(['account'], ({ database, account }: { database: Database, account: Account }) => ({
  account,
  transactions: database.collections.get<Transaction>('transactions').query(Q.where('account_id', account.id), Q.sortBy('transaction_at', 'desc')),
  subCategories: database.collections.get<SubCategory>('sub_categories').query(Q.sortBy('name'))
}));
const EnhancedTransactionSheet = withDatabase(enhance(TransactionSheet));
export default EnhancedTransactionSheet;