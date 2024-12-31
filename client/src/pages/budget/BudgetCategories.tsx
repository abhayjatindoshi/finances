import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import { Database } from '@nozbe/watermelondb';
import React from 'react';
import Category from '../../db/models/Category';
import TableName from '../../db/TableName';
import SubCategory from '../../db/models/SubCategory';
import Tranasction from '../../db/models/Transaction';
import { BudgetTab } from './BudgetPage';
import BudgetChart from './BudgetChart';
import moment from 'moment';

interface BudgetCategoriesProps {
  tab: BudgetTab
  categories: Array<Category>
  subCategories: Array<SubCategory>
  transactions: Array<Tranasction>
}

interface CategoryData {
  category: Category
  transactions: Array<Tranasction>
  total: number
  monthlyTotal: { [key: number]: number }
}

const BudgetCategories: React.FC<BudgetCategoriesProps> = ({ tab, categories, subCategories, transactions }) => {

  const data: Array<CategoryData> = categories.map(category => {
    const subCategoriesIds = subCategories.filter(subCategory => subCategory.category.id === category.id).map(subCategory => subCategory.id);
    const categoryTransactions = transactions.filter(transaction => subCategoriesIds.includes(transaction.subCategory?.id));
    const monthlyTotal: { [key: number]: number } = {};
    categoryTransactions.forEach(transaction => {
      const month = new Date(transaction.transactionAt).getMonth();
      monthlyTotal[month] = (monthlyTotal[month] || 0) + transaction.amount;
    });
    const total = Object.values(monthlyTotal).reduce((acc, val) => acc + val, 0);
    return { category, transactions: categoryTransactions, total, monthlyTotal };
  });

  const filteredCategories = categories.filter(category => {
    switch (tab) {
      case 'monthly':
        return category.monthlyLimit > 0;
      case 'yearly':
        return category.yearlyLimit > 0;
      default:
        return category.monthlyLimit === 0 && category.yearlyLimit === 0;
    }
  });

  return (
    <table className='table-auto text-xl w-full text-center'>
      <thead>
        <tr>
          <th></th>
          {Array.from({ length: 12 }).map((_, index) => (
            <th key={index}>{moment().month((index + 3) % 12).format('MMM')}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredCategories.map(category => (
          <tr key={category.id}>
            <td>{category.name}</td>
            {Array.from({ length: 12 }).map((_, index) => (
              <td key={index} align='center'>
                <BudgetChart size='6rem' category={category} amount={data.find(d => d.category.id === category.id)?.monthlyTotal[(index + 3) % 12] || 0} />
              </td>
            ))}
          </tr>
        ))}
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