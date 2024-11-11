import React from 'react';

interface DashboardCardProps {
  title?: string;
  children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => {
  return (
    <div className='rounded-lg p-2 w-64' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      {title ? <div className='text-xl font-semibold mb-2'>{title}</div> : null}
      <div className='overflow-auto h-48'>
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;