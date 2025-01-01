import EnhancedAccountBalances from './components/AccountBalances';
import EnhancedMonthlyCategoryCost from './components/MonthlyCategoryCost';
import TopSpends from './components/TopSpends';

const DashboardPage: React.FC = () => {

  return (
    <div className='app-content-height'>
      <div className='flex flex-wrap items-start p-4 gap-4'>
        <EnhancedAccountBalances />
        <EnhancedMonthlyCategoryCost />
        <TopSpends />
      </div>
    </div>
  );
};

export default DashboardPage;

