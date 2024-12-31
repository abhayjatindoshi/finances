import { BudgetTab } from './BudgetPage';
import { Database } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import BudgetChart from './BudgetChart';
import BudgetProgress from './BudgetProgress';
import Category from '../../db/models/Category';
import moment from 'moment';
import React from 'react';
import SubCategory from '../../db/models/SubCategory';
import TableName from '../../db/TableName';
import Tranasction from '../../db/models/Transaction';
import { moneyFormat } from '../../constants';
import { useTranslation } from 'react-i18next';

interface BudgetCategoriesProps {
  tab: BudgetTab
  categories: Array<Category>
  subCategories: Array<SubCategory>
  transactions: Array<Tranasction>
}

export interface CategoryData {
  category: Category
  transactions: Array<Tranasction>
  total: number
  monthlyTotal: { [key: number]: number }
  yearlyLimit: number
  budgetPercentage: number
}

const BudgetCategories: React.FC<BudgetCategoriesProps> = ({ tab, categories, subCategories, transactions }) => {

  const { t } = useTranslation();
  const data: Array<CategoryData> = categories
    .map(category => {
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
    })
    .filter(category => category.total < 0)
    .sort((a, b) => b.budgetPercentage - a.budgetPercentage);

  return (
    <table className='table-auto text-xl w-full text-center'>
      <thead>
        <tr>
          <th className='w-56'></th>
          {Array.from({ length: 12 }).map((_, index) => (
            <th key={index}>{moment().month((index + 3) % 12).format('MMM')}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map(row => {
          const category = row.category;
          return (
            <tr key={category.id}>
              <td>
                <div className='flex flex-col items-start m-2 text-xs'>
                  <div className='text-xl'>{category.name}</div>
                  <span><b>{t('app.totalSpent')}:</b> {moneyFormat.format(-row.total)}</span>
                  <span><b>{t('app.yearlyLimit')}:</b> {moneyFormat.format(row.yearlyLimit)}</span>
                  <span><b>{t('app.percentage')}:</b> {row.budgetPercentage.toFixed(0)}</span>
                </div>
              </td>
              {category.monthlyLimit > 0 && tab === 'monthly' && Array.from({ length: 12 }).map((_, index) => (
                <td key={index} align='center'>
                  <BudgetChart size='5rem' category={category} amount={row.monthlyTotal[(index + 3) % 12] || 0} />
                </td>
              ))}
              {(category.monthlyLimit <= 0 || tab === 'yearly') && <td colSpan={12}>
                <BudgetProgress data={row} />
              </td>}
            </tr>
          )
        })}
      </tbody>
    </table>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  categories: database.collections.get<Category>(TableName.Categories).query(),
  subCategories: database.collections.get<SubCategory>(TableName.SubCategories).query(),
  transactions: database.collections.get<Tranasction>(TableName.Transactions).query(),
}));
const EnhancedBudgetCategories = withDatabase(enhance(BudgetCategories));
export default EnhancedBudgetCategories;