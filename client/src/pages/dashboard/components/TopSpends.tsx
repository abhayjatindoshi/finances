import { CategoryData, getBudgetData } from '../../../utils/DbUtils';
import { useTranslation } from 'react-i18next';
import React, { useEffect } from 'react';
import { Progress } from 'antd';

const TopSpends: React.FC = () => {

  const { t } = useTranslation();
  const [data, setData] = React.useState<Array<CategoryData>>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getBudgetData();
      setData(data);
    };
    fetchData();
  }, [setData]);

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
        {data.slice(0, 5).map(row => (
          <DashbordProgess key={row.category.id} percentage={row.budgetPercentage} name={row.category.name} />
        ))}
      </div>
    </div>
  );
};

export default TopSpends;