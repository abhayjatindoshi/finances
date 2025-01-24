import { Q } from "@nozbe/watermelondb";
import database from "../db/database";
import Account from "../db/models/Account";
import Tranasction from "../db/models/Transaction";
import Category from "../db/models/Category";
import TableName from "../db/TableName";
import SubCategory from "../db/models/SubCategory";

export interface AccountBalance {
  balance: number;
  lastUpdate: Date;
  transactionCount: number;
}

export async function getBalanceMap(tenantId: string): Promise<Map<Account, AccountBalance>> {
  const accounts = await database(tenantId).collections.get<Account>('accounts').query().fetch();
  const transactionCollection = database(tenantId).collections.get<Tranasction>('transactions');
  const result = new Map<Account, AccountBalance>();

  for (const account of accounts) {
    const transactions = await transactionCollection
      .query(Q.where('account_id', account.id), Q.sortBy('transaction_at', 'desc'))
      .fetch()
    let balance = account.initialBalance;
    balance = transactions.reduce((balance, transaction) => {
      balance += transaction.amount;
      return balance;
    }, balance);
    balance = parseFloat(balance.toFixed(2));

    result.set(account, {
      balance,
      lastUpdate: transactions[0].transactionAt,
      transactionCount: transactions.length
    });
  }
  return result;
}

export interface CategoryData {
  category: Category
  transactions: Array<Tranasction>
  total: number
  monthlyTotal: { [key: number]: number }
  yearlyLimit: number
  budgetPercentage: number
}

export async function getBudgetData(tenantId: string): Promise<Array<CategoryData>> {
  const categories = await database(tenantId).collections.get<Category>(TableName.Categories).query().fetch();
  const subCategories = await database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query().fetch();
  const transactions = await database(tenantId).collections.get<Tranasction>(TableName.Transactions).query().fetch();

  return categories.map(category => {
    const subCategoriesIds = subCategories.filter(subCategory => subCategory.category.id === category.id).map(subCategory => subCategory.id);
    const categoryTransactions = transactions.filter(transaction => subCategoriesIds.includes(transaction.subCategory?.id));
    const monthlyTotal: { [key: number]: number } = {};
    categoryTransactions.forEach(transaction => {
      const month = new Date(transaction.transactionAt).getMonth();
      monthlyTotal[month] = (monthlyTotal[month] || 0) + transaction.amount;
    });
    const total = Object.values(monthlyTotal).reduce((acc, val) => acc + val, 0);
    const yearlyLimit = category.monthlyLimit > 0 ? category.monthlyLimit * 12 : category.yearlyLimit;
    const budgetPercentage = yearlyLimit > 0 ? total / yearlyLimit * -100 : -total;
    return { category, transactions: categoryTransactions, total, monthlyTotal, yearlyLimit, budgetPercentage };
  }).filter(category => category.total < 0)
    .sort((a, b) => b.budgetPercentage - a.budgetPercentage);
}