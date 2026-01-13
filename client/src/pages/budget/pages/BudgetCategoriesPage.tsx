import { Card, tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomAvatar from '../../../common/CustomAvatar';
import Money from '../../../common/Money';
import { fluentColors } from '../../../constants';
import { pickRandomByHash } from '../../../utils/Common';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';
import CategoryDeepDiveDialog from '../components/CategoryDeepDiveDialog';
import CategoryLineChart from '../components/CategoryLineChart';


const BudgetCategoriesPage: React.FC = () => {
  const { tenantId } = useParams();
  const [budgetData, setBudgetData] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      const data = await getBudgetData(tenantId);
      setBudgetData(data);
    };
    fetchData();
  }, [tenantId]);

  const handleCategoryClick = (category: CategoryData) => {
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCategory(null);
  };

  if (!tenantId) {
    return <div>Please select a tenant.</div>;
  }

  // Calculate global first and last transaction date
  let globalFirstTx: Date | null = null;
  let globalLastTx: Date | null = null;
  budgetData.forEach(cat => {
    cat.transactions.forEach(tx => {
      if (!globalFirstTx || tx.transactionAt < globalFirstTx) globalFirstTx = tx.transactionAt;
      if (!globalLastTx || tx.transactionAt > globalLastTx) globalLastTx = tx.transactionAt;
    });
  });

  // Main summary view
  return (
    <>
      <div style={{
        width: '100vw',
        minHeight: '100vh',
        maxWidth: '100%',
        padding: '16px 0',
        position: 'relative',
        zIndex: 0,
        overflowX: 'hidden',
      }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
        width: '100%',
        padding: '0 24px',
      }}>
        {[...budgetData]
          .sort((a, b) => {
            const aProgress = a.yearlyLimit > 0 ? Math.abs(a.total) / a.yearlyLimit : 0;
            const bProgress = b.yearlyLimit > 0 ? Math.abs(b.total) / b.yearlyLimit : 0;
            return bProgress - aProgress;
          })
          .map((cat, idx) => {
          const progress = cat.yearlyLimit > 0 ? Math.abs(cat.total) / cat.yearlyLimit : 0;
          // Color scale logic
          // Define all gradient color pairs for chart (matching progress bar states)
          const chartGradients: [string, string][] = [
            ['#ff3333', '#ff6666'], // >100% overspent (brighter red)
            ['#ff3c3c', '#ffb347'], // 80-100% warning
            ['#ffe156', '#ffb347'], // 60-80% caution
            ['#3cff7a', '#56e0ff'], // <60% safe
          ];
          let neonGradient, dotGradient, dotShadow, chartGradient;
          if (progress * 100 > 100) {
            neonGradient = 'linear-gradient(90deg, #7a1f1f 0%, #ff3c3c 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #7a1f1f 60%, #ff3c3c 100%)';
            dotShadow = '0 0 24px 6px #7a1f1fcc, 0 0 48px 12px #ff3c3c77';
            chartGradient = chartGradients[0];
          } else if (progress * 100 >= 80) {
            neonGradient = 'linear-gradient(90deg, #ff3c3c 0%, #ffb347 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #ff3c3c 60%, #ffb347 100%)';
            dotShadow = '0 0 24px 6px #ff3c3ccc, 0 0 48px 12px #ffb34777';
            chartGradient = chartGradients[1];
          } else if (progress * 100 >= 60) {
            neonGradient = 'linear-gradient(90deg, #ffe156 0%, #ffb347 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #ffe156 60%, #ffb347 100%)';
            dotShadow = '0 0 24px 6px #ffe156cc, 0 0 48px 12px #ffb34777';
            chartGradient = chartGradients[2];
          } else {
            neonGradient = 'linear-gradient(90deg, #3cff7a 0%, #56e0ff 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #3cff7a 60%, #56e0ff 100%)';
            dotShadow = '0 0 24px 6px #3cff7acc, 0 0 48px 12px #56e0ff77';
            chartGradient = chartGradients[3];
          }
          const amountLeft = cat.yearlyLimit - Math.abs(cat.total);
          const percentLeft = cat.yearlyLimit > 0 ? (amountLeft / cat.yearlyLimit) * 100 : 0;

          // --- Compute monthly spend history from global first/last transaction month ---
          let history: number[] = [];
          if (globalFirstTx && globalLastTx) {
            const startYear = globalFirstTx.getFullYear();
            const startMonth = globalFirstTx.getMonth();
            const endYear = globalLastTx.getFullYear();
            const endMonth = globalLastTx.getMonth();
            const monthsCount = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
            const monthly: number[] = [];
            for (let i = 0; i < monthsCount; i++) {
              const year = startYear + Math.floor((startMonth + i) / 12);
              const month = (startMonth + i) % 12;
              const monthStart = new Date(year, month, 1);
              const monthEnd = new Date(year, month + 1, 0, 23, 59, 59, 999);
              const total = cat.transactions
                .filter(tx => tx.transactionAt >= monthStart && tx.transactionAt <= monthEnd)
                .reduce((sum, tx) => sum + tx.amount, 0);
              monthly.push(Math.abs(total));
            }
            // Interpolate monthly data to 50 points for clarity
            const points = 50;
            if (monthly.length <= 1) {
              history = Array(points).fill(monthly[0] || 0);
            } else {
              for (let i = 0; i < points; i++) {
                const pos = (i * (monthly.length - 1)) / (points - 1);
                const idx = Math.floor(pos);
                const frac = pos - idx;
                if (idx + 1 < monthly.length) {
                  history.push(monthly[idx] * (1 - frac) + monthly[idx + 1] * frac);
                } else {
                  history.push(monthly[monthly.length - 1]);
                }
              }
            }
          }

          return (
            <Card
              key={cat.category.id}
              style={{
                background: `
                  linear-gradient(120deg, rgba(8,10,14,0.98) 0%, rgba(16,18,22,0.98) 100%),
                  repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 16px),
                  radial-gradient(ellipse at 60% 20%, #23283a11 0%, #181c2400 80%)
                `,
                backdropFilter: 'blur(2.5px)',
                WebkitBackdropFilter: 'blur(2.5px)',
                border: '1.5px solid rgba(255,255,255,0.10)',
                boxShadow: '0 4px 24px 0 #000c, 0 1.5px 8px #0008, inset 0 2.5px 12px #fff1, inset 0 -2.5px 12px #0003',
                borderRadius: 18,
                padding: 20,
                minHeight: 140,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                width: '100%',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => handleCategoryClick(cat)}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 8px 32px 0 #000e, 0 2px 12px #000a, inset 0 2.5px 12px #fff2, inset 0 -2.5px 12px #0004';
                e.currentTarget.style.transform = 'scale(1.025)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = '0 4px 24px 0 #000c, 0 1.5px 8px #0008, inset 0 2.5px 12px #fff1, inset 0 -2.5px 12px #0003';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {/* Category spend trend line chart as full-width, bottom-half background */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '40%',
                  zIndex: 0,
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'flex-end',
                }}
              >
                <CategoryLineChart
                  history={history}
                  gradientColors={chartGradient}
                  width={undefined}
                  height={56} // 40% of minHeight 140
                />
              </div>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                  <CustomAvatar
                    size={44}
                    char={cat.category.name.charAt(0)}
                    shape="circle"
                    color={pickRandomByHash(cat.category.name, fluentColors)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: tokens.colorNeutralForegroundOnBrand }}>{cat.category.name}</div>
                    <div style={{ fontSize: 13, color: tokens.colorNeutralForegroundOnBrand, opacity: 0.7 }}>
                      {percentLeft >= 0
                        ? `${percentLeft.toFixed(1)}% left`
                        : `${Math.abs(percentLeft).toFixed(1)}% overspent`}
                    </div>
                  </div>
                </div>
                {/* ...existing card content... */}
              </div>
              {/* Cyberpunk Glassy Progress Bar */}
              <div style={{
                width: '100%',
                height: 22,
                background: 'rgba(8,10,14,0.92)',
                borderRadius: 14,
                boxShadow: '0 4px 24px 0 #000b, 0 1.5px 8px #0008',
                position: 'relative',
                margin: '0',
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(2.5px)',
                WebkitBackdropFilter: 'blur(2.5px)',
                display: 'flex',
                alignItems: 'center',
              }}>
                {/* Neon Fill */}
                <div style={{
                  width: `${progress * 100}%`,
                  height: '100%',
                  background: neonGradient,
                  boxShadow: dotShadow,
                  borderRadius: 14,
                  transition: 'width 0.5s cubic-bezier(.4,2,.6,1)',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 1,
                  filter: 'blur(0.5px)',
                }} />
                {/* Glassy highlight overlay */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '60%',
                  borderRadius: 14,
                  background: 'linear-gradient(180deg, #fff3 0%, #fff1 80%, #fff0 100%)',
                  zIndex: 2,
                  pointerEvents: 'none',
                }} />
                {/* Soft inner shadow for depth */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 14,
                  boxShadow: 'inset 0 2.5px 12px #fff1, inset 0 -2.5px 12px #0003',
                  zIndex: 3,
                  pointerEvents: 'none',
                }} />
                {/* Glowing endpoint dot */}
                <div style={{
                  position: 'absolute',
                  left: `calc(${Math.max(progress * 100, 2)}% - 13px)`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: dotGradient,
                  boxShadow: dotShadow,
                  border: '3px solid #fff8',
                  zIndex: 4,
                  animation: 'pulse 1.2s infinite alternate',
                  transition: 'left 0.5s cubic-bezier(.4,2,.6,1)',
                }} />
                {/* Percentage text, centered */}
                <span style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#fff',
                  opacity: 0.92,
                  zIndex: 5,
                  letterSpacing: 0.5,
                  textShadow: '0 2px 8px #000b, 0 1px 4px #fff8',
                  pointerEvents: 'none',
                  fontFamily: 'Segoe UI, Arial, sans-serif',
                  textAlign: 'center',
                  width: '100%',
                }}>{(progress * 100).toFixed(0)}%</span>
              </div>
              {/* Remove the right-side percentage left display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                {/* Left: <amount left> of <budget amount> */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontWeight: 600, color: tokens.colorNeutralForegroundOnBrand }}>
                    <Money amount={amountLeft} />
                  </span>
                  <span style={{ color: tokens.colorNeutralForegroundOnBrand, opacity: 0.8, margin: '0 4px' }}>of</span>
                  <span style={{ color: tokens.colorNeutralForegroundOnBrand, opacity: 0.8 }}>
                    <Money amount={cat.yearlyLimit} />
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>                
    </div>
    
    {/* Category Deep Dive Dialog */}
    <CategoryDeepDiveDialog
      category={selectedCategory}
      isOpen={isDialogOpen}
      onClose={handleCloseDialog}
      tenantId={tenantId}
    />
    </>
  );
};

export default BudgetCategoriesPage; 