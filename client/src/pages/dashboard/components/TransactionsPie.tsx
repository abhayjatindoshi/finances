import { Database, Q } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import React, { useEffect } from 'react';
import TableName from '../../../db/TableName';
import Category from '../../../db/models/Category';
import Transaction from '../../../db/models/Transaction';
import SubCategory from '../../../db/models/SubCategory';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';
import { AgCharts } from "ag-charts-react";
import { AgChartOptions } from 'ag-charts-community';


const TransactionsPie: React.FC = () => {

  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBudgetData();
      setData(data.sort((a, b) => a.total - b.total));
    };
    fetchData();
  }, [setData]);

  const chartOptions: AgChartOptions = {
    theme: 'ag-default-dark',
    legend: {
      enabled: false,
    },
    background: {
      fill: 'rgba(0,0,0,0)',
    },
    data: data.map(d => ({ category: d.category.name, total: -d.total.toFixed(2), percentage: `${d.budgetPercentage}%` })),
    series: [{
      type: 'pie',
      angleKey: 'total',
      legendItemKey: 'category',
      sectorLabelKey: 'percentage',
      sectorSpacing: 0,
    }],
  }

  return (
    <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <AgCharts options={chartOptions} />
    </div>
  );
};
const enhance = withObservables([], ({ database }: { database: Database }) => ({
  categories: database.collections.get<Category>(TableName.Categories).query(Q.sortBy('name')),
  subCategories: database.collections.get<SubCategory>(TableName.SubCategories).query(Q.sortBy('name')),
  transactions: database.collections.get<Transaction>(TableName.Transactions).query(),
}));
const EnhancedTransactionsPie = withDatabase(enhance(TransactionsPie));
export default EnhancedTransactionsPie;