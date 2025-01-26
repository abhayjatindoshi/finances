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

      if (transaction.subCategory?.id) {
        row.classification = JSON.stringify({ subCategoryId: transaction.subCategory.id });
      } else if (transaction.transferAccount?.id) {
        row.classification = JSON.stringify({ transferAccountId: transaction.transferAccount.id });
      }

      prevBalance = row.balance;
      return row;
    }).reverse();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateTransactionRow = async (tenantId: string, transaction: TransactionRow, columnName: string, updatedValue: any) => {
  switch (columnName) {
    case 'date': {
      await update(tenantId, transaction.raw, t => {
        t.transactionAt = updatedValue ?? new Date(0);
      });
      break;
    }

    case 'title': {
      await update(tenantId, transaction.raw, t => {
        t.title = updatedValue;
      });
      break;
    }

    case 'withdraw': {
      await update(tenantId, transaction.raw, t => {
        t.amount = -updatedValue;
      });
      break;
    }

    case 'deposit': {
      await update(tenantId, transaction.raw, t => {
        t.amount = updatedValue;
      });
      break;
    }

    case 'classification': {
      try {
        if (!updatedValue || !updatedValue.value) {
          await update(tenantId, transaction.raw, t => {
            if (t.subCategory) t.subCategory.id = null;
            if (t.transferAccount) t.transferAccount.id = null;
          });
          break;
        }

        const rawText = updatedValue.value;
        const classification = JSON.parse(rawText);
        if (classification.subCategoryId) {
          await update(tenantId, transaction.raw, t => {
            if (t.subCategory) t.subCategory.id = classification.subCategoryId;
            if (t.transferAccount) t.transferAccount.id = null;
          });
        }

        if (classification.transferAccountId) {
          await update(tenantId, transaction.raw, t => {
            if (t.transferAccount) t.transferAccount.id = classification.transferAccountId;
            if (t.subCategory) t.subCategory.id = null;
          });
        }
      } catch (e) {
        console.error(e);
      }
      break;
    }
  }
}

const update = async (tenantId: string, transaction: Transaction, updater: (t: Transaction) => void) => {
  return await database(tenantId).write(async () => {
    await transaction.update(updater);
  });
}
