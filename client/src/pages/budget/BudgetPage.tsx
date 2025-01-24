import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Segmented } from 'antd';
import BudgetCategories from './BudgetCategories';


export type BudgetTab = 'monthly' | 'yearly';

const BudgetPage: React.FC = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tab } = useParams();
  const [selectedTab, setSelectedTab] = React.useState<BudgetTab>('monthly');

  React.useEffect(() => {
    if (tab === 'monthly' || tab === 'yearly') {
      setSelectedTab(tab);
    } else {
      navigate('/budget/monthly');
    }
  }, [navigate, tab]);

  return (
    <>
      <div className='p-2 flex flex-col gap-2 app-content-height'>
        <div className='w-full grow overflow-auto'>
          <BudgetCategories tab={selectedTab} />
        </div>
        <Segmented className='self-center' options={[
          { label: t('app.monthly'), value: 'monthly' },
          { label: t('app.yearly'), value: 'yearly' }
        ]} value={selectedTab} onChange={(value) => navigate(`/budget/${value}`)} />
      </div>
    </>
  );
};

export default BudgetPage;