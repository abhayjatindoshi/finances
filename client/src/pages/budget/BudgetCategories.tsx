import { BudgetTab } from './BudgetPage';
import { Database } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import BudgetChart from './BudgetChart';
import BudgetProgress from './BudgetProgress';
import Category from '../../db/models/Category';
import moment from 'moment';
import React, { useEffect } from 'react';
import SubCategory from '../../db/models/SubCategory';
import TableName from '../../db/TableName';
import Tranasction from '../../db/models/Transaction';
import { moneyFormat } from '../../constants';
import { useTranslation } from 'react-i18next';
import { CategoryData, getBudgetData } from '../../utils/DbUtils';
import { Typography } from 'antd';

interface BudgetCategoriesProps {
  tab: BudgetTab
  categories: Array<Category>
  subCategories: Array<SubCategory>
  transactions: Array<Tranasction>
}

const BudgetCategories: React.FC<BudgetCategoriesProps> = ({ tab, categories, subCategories, transactions }) => {

  const { t } = useTranslation();
  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      const data = await getBudgetData();
      setData(data);
    }

    fetchCategoryData();
  }, [setData]);

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
                <div className='flex flex-col items-start m-2 text-xs min-w-36'>
                  <Typography.Text className='text-xl' ellipsis>{category.name}</Typography.Text>
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