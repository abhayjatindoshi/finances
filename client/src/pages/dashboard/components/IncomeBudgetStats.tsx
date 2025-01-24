import { Q } from '@nozbe/watermelondb';
import { useTranslation } from 'react-i18next';
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import TableName from '../../../db/TableName';
import Category, { CategoryType } from '../../../db/models/Category';
import Transaction from '../../../db/models/Transaction';
import Tranasction from '../../../db/models/Transaction';
import SubCategory from '../../../db/models/SubCategory';
import Money from '../../../common/Money';
import database from '../../../db/database';
import { useParams } from 'react-router-dom';

interface IncomeBudgetStatsProps {
  categories: Array<Category>;
  subCategories: Array<SubCategory>;
  transactions: Array<Tranasction>;
}

const IncomeBudgetStats: React.FC<IncomeBudgetStatsProps> = ({ categories, subCategories, transactions }) => {

  const { t } = useTranslation();

  const incomeCategoryIds = categories
    .filter(c => c.type === CategoryType.Income)
    .map(c => c.id);
  const incomeSubCategoryIds = subCategories
    .filter((s) => incomeCategoryIds.includes(s.category.id))
    .map(s => s.id);
  const totalIncome = transactions
    .filter(t => t.subCategory?.id && incomeSubCategoryIds.includes(t.subCategory.id))
    .reduce((total, t) => total + t.amount, 0);

  const totalBudget = categories
    .reduce((total, c) => total + c.monthlyLimit * 12 + c.yearlyLimit, 0);

  const nonIncomeCategoryIds = categories
    .filter(c => c.type !== CategoryType.Income)
    .map(c => c.id);
  const nonIncomeSubCategoryIds = subCategories
    .filter((s) => nonIncomeCategoryIds.includes(s.category.id))
    .map(s => s.id);
  const totalSpent = transactions
    .filter(t => t.subCategory?.id && nonIncomeSubCategoryIds.includes(t.subCategory.id))
    .reduce((total, t) => total + t.amount, 0);

  return (
    <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <div className='flex flex-col items-end'>
        <div className='text-sm' style={{ color: 'var(--ant-color-text-tertiary' }}>{t('app.income')}</div>
        <div className='text-lg'><Money amount={totalIncome} /></div>
        <div className='text-sm' style={{ color: 'var(--ant-color-text-tertiary' }}>{t('app.budget')}</div>
        <div className='text-lg'><Money amount={totalBudget} /></div>
        <div className='text-sm' style={{ color: 'var(--ant-color-text-tertiary' }}>{t('app.totalSpent')}</div>
        <div className='text-lg'><Money amount={-totalSpent} /></div>
      </div>
    </div>
  );
};
const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(Q.sortBy('name')),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(Q.sortBy('name')),
  transactions: database(tenantId).collections.get<Transaction>(TableName.Transactions).query(),
}));
const EnhancedIncomeBudgetStats = () => {
  const { tenantId } = useParams();
  return enhance(IncomeBudgetStats)(tenantId);
};
export default EnhancedIncomeBudgetStats;