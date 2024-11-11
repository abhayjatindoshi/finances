import React from 'react';
import EnhancedAccountBalances from './components/AccountBalances';
import DashboardCard from './components/DashboardCard';

const DashboardPage: React.FC = ({ }) => {
  return (
    <div className='p-4 app-content-height'>
      <DashboardCard title='Current Balances'>
        <EnhancedAccountBalances />
      </DashboardCard>
    </div>
  );
};

export default DashboardPage;

