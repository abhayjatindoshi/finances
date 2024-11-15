import React from 'react';
import Transaction from '../../db/models/Transaction';
import Account from '../../db/models/Account';
import { ReactGrid, Column, Row, DefaultCellTypes } from "@silevis/reactgrid";
import { Q, Database } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import "@silevis/reactgrid/styles.css";

interface TransactionSheetProps {
  account: Account,
  transactions: Array<Transaction>
}

class EntendedTransaction extends Transaction {
  index = 0;
  balance = 0;
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ account, transactions }) => {

  let prevBalance = account.initialBalance;
  for (let i = transactions.length - 1; i >= 0; i--) {
    const transaction = transactions[i] as EntendedTransaction;
    transaction.index = i + 1;
    transaction.balance = prevBalance + transaction.amount;
    prevBalance = transaction.balance;
  }

  const columns: Array<Column> = [
    { columnId: 'id' },
    { columnId: 'subCategory' },
    { columnId: 'time' },
    { columnId: 'title' },
    { columnId: 'withdraw' },
    { columnId: 'deposit' },
    { columnId: 'balance' }
  ]

  const headerRow: Row = {
    rowId: "header",
    cells: [
      { type: "header", text: "ID" },
      { type: "header", text: "Sub Category" },
      { type: "header", text: "Time" },
      { type: "header", text: "Title" },
      { type: "header", text: "Withdraw" },
      { type: "header", text: "Deposit" },
      { type: "header", text: "Balance" }
    ]
  };

  const convert = (transaction: Transaction[]): Row<DefaultCellTypes>[] => [
    headerRow,
    ...transaction.map<Row>((transaction, idx) => ({
      rowId: idx,
      cells: [
        { type: "text", text: transaction.id } as DefaultCellTypes,
        { type: "text", text: transaction.subCategory?.id ?? '' } as DefaultCellTypes,
        { type: "text", text: transaction.transactionAt.toString() } as DefaultCellTypes,
        { type: "text", text: transaction.title } as DefaultCellTypes,
        { type: "text", text: transaction.amount < 0 ? (-transaction.amount).toString() : '' } as DefaultCellTypes,
        { type: "text", text: transaction.amount > 0 ? (transaction.amount).toString() : '' } as DefaultCellTypes,
        { type: "text", text: transaction.amount.toString() } as DefaultCellTypes
      ]
    }))
  ];

  return (
    <div>
      <ReactGrid columns={columns} rows={convert(transactions)} />
    </div>
  );
};

const enhance = withObservables(['account'], ({ database, account }: { database: Database, account: Account }) => ({
  account,
  transactions: database.collections.get<Transaction>('transactions').query(Q.where('account_id', account.id), Q.sortBy('transaction_at', 'desc'))
}));
const EnhancedTransactionSheet = withDatabase(enhance(TransactionSheet));
export default EnhancedTransactionSheet;