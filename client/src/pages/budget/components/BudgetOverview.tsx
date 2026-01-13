import React, { useEffect, useState } from 'react';
import { moneyFormat } from '../../../constants';
import Category, { CategoryType } from '../../../db/models/Category';
import { CategoryData } from '../../../utils/DbUtils';

import { useParams } from 'react-router-dom';
import database from '../../../db/database';
import SubCategory from '../../../db/models/SubCategory';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';

type Props = {
  hovered: string | null;
  setHovered: (v: string | null) => void;
  cardBaseStyle: React.CSSProperties;
  cardHoverStyle: React.CSSProperties;
  budgetData: CategoryData[];
};

const BudgetOverview: React.FC<Props> = ({ hovered, setHovered, cardBaseStyle, cardHoverStyle, budgetData }) => {
  const { tenantId } = useParams();
  const [transactions, setTransactions] = useState<Tranasction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    if (!tenantId) return;
    // Fetch all needed data in parallel
    Promise.all([
      database(tenantId).collections.get<Tranasction>('transactions').query().fetch(),
      database(tenantId).collections.get<Category>(TableName.Categories).query().fetch(),
      database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query().fetch(),
    ]).then(([txns, cats, subCats]) => {
      setTransactions(txns);
      setCategories(cats);
      setSubCategories(subCats);
    });
  }, [tenantId]);

  // Correct pattern: get all income subcategory IDs, then filter transactions by subCategory.id
  const incomeCategoryIds = categories.filter(c => c.type === CategoryType.Income).map(c => c.id);
  const incomeSubCategoryIds = subCategories.filter(s => incomeCategoryIds.includes(s.category.id)).map(s => s.id);
  const totalIncome = transactions
    .filter(t => t.subCategory?.id && incomeSubCategoryIds.includes(t.subCategory.id))
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalBudget = budgetData.reduce((sum, item) => sum + item.yearlyLimit, 0);
  const totalSpent = budgetData.reduce((sum, item) => sum + Math.abs(item.total), 0);
  const totalLeft = totalBudget - totalSpent;

  return (
    <div
      style={{
        ...cardBaseStyle,
        ...(hovered === 'summary' ? cardHoverStyle : {}),
        flex: '0 1 360px',
        padding: '24px',
      }}
      onMouseEnter={() => setHovered('summary')}
      onMouseLeave={() => setHovered(null)}
    >
      <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Budget Overview</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16 }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Total Income</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#60a5fa' }}>{moneyFormat.format(totalIncome)}</div>
        </div>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Total Budget</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{moneyFormat.format(totalBudget)}</div>
        </div>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Spent</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#f87171' }}>{moneyFormat.format(totalSpent)}</div>
        </div>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Left</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#34d399' }}>{moneyFormat.format(totalLeft)}</div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOverview;
