import EnhancedAccountBalances from './components/AccountBalances';
import IncomeBudgetStats from './components/IncomeBudgetStats';
import EnhancedMonthlyCategoryCost from './components/MonthlyCategoryCost';
import TopSpends from './components/TopSpends';
import TransactionsPie from './components/TransactionsPie';

const DashboardPage: React.FC = () => {

  return (
    <div className='app-content-height'>
      <div className='flex flex-wrap items-start justify-center p-4 gap-4'>
        <EnhancedAccountBalances />
        <EnhancedMonthlyCategoryCost />
        <TopSpends />
        <IncomeBudgetStats />
        <TransactionsPie />
      </div>
    </div>
  );
};

export default DashboardPage;

