import React from 'react';
import EnhancedAccountBalances from './components/AccountBalances';
import DashboardCard from './components/DashboardCard';
import { useTranslation } from 'react-i18next';
import EnhancedMonthlyCategoryCost from './components/MonthlyCategoryCost';

const DashboardPage: React.FC = () => {

  const { t } = useTranslation();

  return (
    <div className='app-content-height'>
      <div className='flex p-4 gap-4'>
        <DashboardCard size='small' title={t('app.currentBalance')}>
          <EnhancedAccountBalances />
        </DashboardCard>
        <EnhancedMonthlyCategoryCost />
      </div>
    </div>
  );
};

export default DashboardPage;

