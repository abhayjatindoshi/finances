import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';
import AlertsPanel from '../components/AlertsPanel';
import BudgetOverview from '../components/BudgetOverview';
import TransferInsights from '../components/TransferInsights';




const cardBaseStyle: React.CSSProperties = {
  background: 'linear-gradient(120deg, rgba(8,10,14,0.98) 0%, rgba(16,18,22,0.98) 100%)',
  backdropFilter: 'blur(2.5px)',
  WebkitBackdropFilter: 'blur(2.5px)',
  border: '1.5px solid rgba(255,255,255,0.10)',
  boxShadow: '0 4px 24px 0 #000c, 0 1.5px 8px #0008, inset 0 2.5px 12px #fff1, inset 0 -2.5px 12px #0003',
  borderRadius: 18,
};

const cardHoverStyle: React.CSSProperties = {
  boxShadow: '0 0 0 1px rgba(96,165,250,0.25), 0 10px 36px 0 #000f, 0 4px 16px #000a, inset 0 2.5px 12px #fff2, inset 0 -2.5px 12px #0004',
  filter: 'drop-shadow(0 0 8px rgba(96,165,250,0.12))',
};

const BudgetSummaryPage: React.FC = () => {
  const { tenantId } = useParams();
  const [budgetData, setBudgetData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const budget = await getBudgetData(tenantId);
        setBudgetData(budget);
  // Fetch all transactions for the tenant (no longer needed)
      } catch (e) {
        // ignore/log error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);



  return (
    <div style={{
      // width: '100%',
      padding: '32px 12px',
      display: 'flex',
      flexDirection: 'row',
      gap: 32,
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      justifyContent: 'center',
      // No minHeight or height here
    }}>

      {/* Block 1: Budget Summary */}
      <div style={{ padding: '0 0 24px 0', width: '100%', maxWidth: 420 }}>
        <BudgetOverview
          hovered={hovered}
          setHovered={setHovered}
          cardBaseStyle={cardBaseStyle}
          cardHoverStyle={cardHoverStyle}
          budgetData={budgetData}
        />
      </div>

      {/* Block 2: Alerts as notifications */}
      <div style={{ padding: '0 0 24px 0', width: '100%', maxWidth: 420 }}>
        <AlertsPanel
          hovered={hovered}
          setHovered={setHovered}
          cardBaseStyle={cardBaseStyle}
          cardHoverStyle={cardHoverStyle}
          budgetData={budgetData}
          loading={loading}
        />
      </div>

      {/* Block 3: Transfer Insights List */}
      <TransferInsights />

      {/* TODO: Add more blocks for insights, trends, or quick actions */}
    </div>
  );
};

export default BudgetSummaryPage;