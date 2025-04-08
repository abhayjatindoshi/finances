import { Progress } from 'antd';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';

const TopSpends: React.FC = () => {

  const { tenantId } = useParams();
  const { t } = useTranslation();
  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      const data = await getBudgetData(tenantId);
      setData(data);
    };
    fetchData();
  }, [setData, tenantId]);

  function DashbordProgess({ percentage, name }: { percentage: number, name: string }) {
    const textColor = percentage > 100 ? 'var(--ant-red)' : 'var(--ant-color-text)';
    return <Progress type="dashboard" percent={parseInt(percentage.toFixed(0))}
      success={{ percent: parseInt((percentage - 100).toFixed(0)), strokeColor: 'var(--ant-red)' }}
      format={() => <div className='flex flex-col items-center'>
        <span className='text-sm w-24' style={{ color: textColor }}>{name}</span>
        <span style={{ color: textColor }}>{percentage.toFixed(0)}%</span>
      </div>} />
  }

  return (
    <div className='rounded-lg p-2' style={{ backgroundColor: 'var(--ant-color-bg-container)', width: '26rem' }}>
      <div className='text-xl font-semibold mb-2'>{t('app.topSpends')}</div>
      <div className='flex flex-wrap items-center justify-center gap-4'>
        {data.filter(row => row.yearlyLimit > 0).slice(0, 5).map(row => (
          <DashbordProgess key={row.category.id} percentage={row.budgetPercentage} name={row.category.name} />
        ))}
      </div>
    </div>
  );
};

export default TopSpends;