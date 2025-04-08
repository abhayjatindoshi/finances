import { DonutChart, DonutChartProps } from '@fluentui/react-charts';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { antColors } from '../../../constants';
import TableName from '../../../db/TableName';
import database from '../../../db/database';
import Category from '../../../db/models/Category';
import SubCategory from '../../../db/models/SubCategory';
import Transaction from '../../../db/models/Transaction';
import { pickRandomByHash } from '../../../utils/Common';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';


const TransactionsPie: React.FC = () => {

  const { tenantId } = useParams();
  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      const data = await getBudgetData(tenantId);
      setData(data.sort((a, b) => a.total - b.total));
    };
    fetchData();
  }, [setData, tenantId]);

  const total = data.reduce((total, d) => total + -d.total, 0);
  const average = total / data.length / 1.5;
  const otherData = data.filter(d => -d.total < average)
    .reduce((otherData, d) => ({
      total: otherData.total + d.total,
      category: {
        name: [...otherData.category.name, d.category.name]
      }
    }), { total: 0, category: { name: new Array<string>() } });

  const chartData: DonutChartProps = {
    data: {
      chartData: [...data.filter(d => -d.total > average), {...otherData, category: {name: otherData.category.name.join(',')}}].map(d => ({
        legend: d.category.name,
        data: -d.total.toFixed(2),
        color: `var(--ant-${pickRandomByHash(d.category.name, antColors)})`,
      })),
    },
    showLabelsInPercent: true,
    hideLabels: false,
    innerRadius: 50,
    height: 300,
    width: 300,
  }

  return (
    <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      <DonutChart {...chartData} />
    </div>
  );
};
const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(Q.sortBy('name')),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(Q.sortBy('name')),
  transactions: database(tenantId).collections.get<Transaction>(TableName.Transactions).query(),
}));
const EnhancedTransactionsPie = () => {
  const { tenantId } = useParams();
  const EnhancedTransactionsPie = enhance(TransactionsPie);
  return <EnhancedTransactionsPie tenantId={tenantId} />;
};
export default EnhancedTransactionsPie;