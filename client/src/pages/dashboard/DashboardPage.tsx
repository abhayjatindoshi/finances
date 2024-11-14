import React from 'react';
import EnhancedAccountBalances from './components/AccountBalances';
import DashboardCard from './components/DashboardCard';
import { useTranslation } from 'react-i18next';

const DashboardPage: React.FC = () => {

  const { t } = useTranslation();

  return (
    <div className='p-4 app-content-height'>
      <DashboardCard title={t('app.currentBalance')}>
        <EnhancedAccountBalances />
      </DashboardCard>
    </div>
  );
};

export default DashboardPage;

