import AccountBalances from './components/AccountBalances';

const DashboardPage: React.FC = () => {

  return (
    <div className='app-content-height overflow-scroll'>
      <div className='flex flex-wrap items-start justify-center p-4 gap-4'>
        <AccountBalances />
        {/* <MonthlyCategoryCost /> */}
        {/* <TopSpends /> */}
        {/* <TransactionsPie /> */}
        {/* <IncomeBudgetStats /> */}
        {/* <TransferAnalysis /> */}
      </div>
    </div>
  );
};

export default DashboardPage;

