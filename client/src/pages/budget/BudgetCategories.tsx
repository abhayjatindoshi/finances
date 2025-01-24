import { BudgetTab } from './BudgetPage';
import { CategoryData, getBudgetData } from '../../utils/DbUtils';
import { moneyFormat } from '../../constants';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import BudgetChart from './BudgetChart';
import BudgetProgress from './BudgetProgress';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface BudgetCategoriesProps {
  tab: BudgetTab
}

const BudgetCategories: React.FC<BudgetCategoriesProps> = ({ tab }) => {

  const { t } = useTranslation();
  const { tenantId } = useParams();
  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!tenantId) return;
      const data = await getBudgetData(tenantId);
      setData(data);
    }

    fetchCategoryData();
  }, [setData, tenantId]);

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

export default BudgetCategories;