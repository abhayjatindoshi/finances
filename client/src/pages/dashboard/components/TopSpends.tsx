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

  function DashboardProgress({ percentage, name }: { percentage: number, name: string }) {
    const textColor = percentage > 100 ? 'var(--ant-red)' : 'var(--ant-color-text)';
    const radius = 60;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="flex flex-col items-center">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="var(--ant-color-border)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={percentage > 100 ? 'var(--ant-red)' : 'var(--ant-blue)'}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className='flex flex-col items-center mt-2'>
          <span className='text-sm w-24 text-center' style={{ color: textColor }}>{name}</span>
          <span style={{ color: textColor }}>{percentage.toFixed(0)}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-lg p-2' style={{ backgroundColor: 'var(--ant-color-bg-container)', width: '26rem' }}>
      <div className='text-xl font-semibold mb-2'>{t('app.topSpends')}</div>
      <div className='flex flex-wrap items-center justify-center gap-4'>
        {data.filter(row => row.yearlyLimit > 0).slice(0, 5).map(row => (
          <DashboardProgress key={row.category.id} percentage={row.budgetPercentage} name={row.category.name} />
        ))}
      </div>
    </div>
  );
};

export default TopSpends;