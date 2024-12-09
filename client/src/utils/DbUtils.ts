import { Q } from "@nozbe/watermelondb";
import database from "../db/database";
import Account from "../db/models/Account";
import Tranasction from "../db/models/Transaction";
import { sync } from "../db/sync";

export async function getCurrentAccountBalance(account: Account): Promise<number> {
  const transactionCollection = database.collections.get<Tranasction>('transactions');
  const transactions = await transactionCollection.query(Q.where('account_id', account.id)).fetch()
  let currentBalance = account.initialBalance;
  currentBalance = transactions.reduce((currentBalance, transaction) => {
    currentBalance += transaction.amount;
    return currentBalance;
  }, currentBalance);
  return parseFloat(currentBalance.toFixed(2));
}

export async function autoSync() {
  setInterval(() => sync(), 20000) // 20 seconds
}