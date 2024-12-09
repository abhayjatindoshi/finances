import React from 'react';

interface DashboardCardProps {
  title?: string;
  children?: React.ReactNode;
  size: 'small' | 'medium' | 'large';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, size }) => {

  const widthClass = size === 'small' ? 'w-64' : size === 'medium' ? 'w-96' : 'w-128';
  const heightClass = size === 'small' ? 'h-48' : size === 'medium' ? 'h-64' : 'h-96';

  return (
    <div className={`rounded-lg p-2 ${widthClass}`} style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      {title ? <div className='text-xl font-semibold mb-2'>{title}</div> : null}
      <div className={`overflow-auto ${heightClass}`}>
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;