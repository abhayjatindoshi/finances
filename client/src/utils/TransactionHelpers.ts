import { Cell, CheckboxCell, DateCell, Id, NumberCell, TextCell } from "@silevis/reactgrid";
import Transaction from "../db/models/Transaction";
import database from "../db/database";

export interface TransactionRow {
  selected: boolean;
  id: string;
  date: Date;
  title: string;
  withdraw: number;
  deposit: number;
  classification: string;
  balance: number;
  raw: Transaction;
}

export const convertToTransactionRows = (transactions: Array<Transaction>, selectedTransactionIds: string[], initialBalance?: number): Array<TransactionRow> => {
  let prevBalance = initialBalance || 0;
  return transactions
    .sort((a, b) => a.transactionAt.getTime() - b.transactionAt.getTime())
    .map((transaction) => {
      const row: TransactionRow = {
        selected: selectedTransactionIds.includes(transaction.id),
        id: transaction.id,
        date: transaction.transactionAt,
        title: transaction.title,
        withdraw: transaction.amount < 0 ? -transaction.amount : 0,
        deposit: transaction.amount > 0 ? transaction.amount : 0,
        classification: '',
        balance: prevBalance + transaction.amount,
        raw: transaction,
      };

      if (transaction.subCategory) {
        row.classification = JSON.stringify({ subCategoryId: transaction.subCategory.id });
      } else if (transaction.transferAccount) {
        row.classification = JSON.stringify({ transferAccountId: transaction.transferAccount.id });
      }

      prevBalance = row.balance;
      return row;
    }).reverse();
}

export const updateTransaction = async (transaction: TransactionRow, columnId: Id, updatedCell: Cell, setTransactionSelectionStatus: (transactionId: string, selectionStatus: boolean) => void) => {
  switch (columnId) {
    case 'selection': {
      setTransactionSelectionStatus(transaction.id, (updatedCell as CheckboxCell).checked)
      break;
    }
    case 'date': {
      await update(transaction.raw, t => {
        t.transactionAt = (updatedCell as DateCell).date ?? new Date(0);
      });
      break;
    }

    case 'title': {
      await update(transaction.raw, t => {
        t.title = (updatedCell as TextCell).text;
      });
      break;
    }

    case 'withdraw': {
      await update(transaction.raw, t => {
        t.amount = -(updatedCell as NumberCell).value;
      });
      break;
    }

    case 'deposit': {
      await update(transaction.raw, t => {
        t.amount = (updatedCell as NumberCell).value;
      });
      break;
    }

    case 'classification': {
      try {
        const classification = JSON.parse((updatedCell as TextCell).text);
        if (classification.subCategoryId) {
          await update(transaction.raw, t => {
            if (t.subCategory) t.subCategory.id = classification.subCategoryId;
          });
        }

        if (classification.transferAccountId) {
          await update(transaction.raw, t => {
            if (t.transferAccount) t.transferAccount.id = classification.transferAccountId;
          });
        }
      } catch(e) {
        console.error(e);
      }
      break;
    }
  }
}

const update = async (transaction: Transaction, updater: (t: Transaction) => void) => {
  return await database.write(async () => {
    await transaction.update(updater);
  });
}
