import AccountBalances from './components/AccountBalances';
import IncomeBudgetStats from './components/IncomeBudgetStats';
import MonthlyCategoryCost from './components/MonthlyCategoryCost';
import TopSpends from './components/TopSpends';
import TransactionsPie from './components/TransactionsPie';
import TransferAnalysis from './components/TransferAnalysis';

const DashboardPage: React.FC = () => {

  return (
    <div className='app-content-height overflow-scroll'>
      <div className='flex flex-wrap items-start justify-center p-4 gap-4'>
        <AccountBalances />
        <MonthlyCategoryCost />
        <TopSpends />
        <TransactionsPie />
        <IncomeBudgetStats />
        <TransferAnalysis />
      </div>
    </div>
  );
};

export default DashboardPage;

