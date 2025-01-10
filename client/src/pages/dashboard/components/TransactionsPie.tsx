import { Database, Q } from '@nozbe/watermelondb';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import React, { useEffect } from 'react';
import TableName from '../../../db/TableName';
import Category from '../../../db/models/Category';
import Transaction from '../../../db/models/Transaction';
import SubCategory from '../../../db/models/SubCategory';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

const TransactionsPie: React.FC = () => {

  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBudgetData();
      setData(data.sort((a, b) => a.total - b.total));
    };
    fetchData();
  }, [setData]);

  const series = data.map(d => -d.total.toFixed(2));
  const options: ApexOptions = {
    chart: {
      width: 500,
      type: 'pie',
    },
    colors: ['#1677FF', '#722ED1', '#13C2C2', '#52C41A', '#EB2F96', '#EB2F96', '#F5222D', '#FA8C16', '#FADB14', '#FA541C', '#2F54EB', '#FAAD14', '#A0D911', '#1554ad', '#51258f', '#138585', '#3c8618', '#a02669', '#a02669', '#a61d24', '#aa6215', '#aa9514', '#aa3e19', '#263ea0', '#aa7714', '#6f9412'],
    legend: {
      show: false
    },
    labels: data.map(d => d.category.name)
  };

  return (
    <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <ReactApexChart options={options} series={series} type="donut" height={500} />
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