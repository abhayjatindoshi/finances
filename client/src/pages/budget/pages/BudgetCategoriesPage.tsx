import { Card, tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CustomAvatar from '../../../common/CustomAvatar';
import Money from '../../../common/Money';
import { fluentColors } from '../../../constants';
import { pickRandomByHash } from '../../../utils/Common';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';
import CategoryDeepDiveDialog from '../components/CategoryDeepDiveDialog';


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
        {budgetData.map((cat, idx) => {
          const progress = cat.yearlyLimit > 0 ? Math.abs(cat.total) / cat.yearlyLimit : 0;
          // Color scale logic
          let neonGradient, dotGradient, dotShadow;
          if (progress * 100 > 100) {
            neonGradient = 'linear-gradient(90deg, #7a1f1f 0%, #ff3c3c 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #7a1f1f 60%, #ff3c3c 100%)';
            dotShadow = '0 0 24px 6px #7a1f1fcc, 0 0 48px 12px #ff3c3c77';
          } else if (progress * 100 >= 80) {
            neonGradient = 'linear-gradient(90deg, #ff3c3c 0%, #ffb347 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #ff3c3c 60%, #ffb347 100%)';
            dotShadow = '0 0 24px 6px #ff3c3ccc, 0 0 48px 12px #ffb34777';
          } else if (progress * 100 >= 60) {
            neonGradient = 'linear-gradient(90deg, #ffe156 0%, #ffb347 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #ffe156 60%, #ffb347 100%)';
            dotShadow = '0 0 24px 6px #ffe156cc, 0 0 48px 12px #ffb34777';
          } else {
            neonGradient = 'linear-gradient(90deg, #3cff7a 0%, #56e0ff 100%)';
            dotGradient = 'radial-gradient(circle, #fff 0%, #3cff7a 60%, #56e0ff 100%)';
            dotShadow = '0 0 24px 6px #3cff7acc, 0 0 48px 12px #56e0ff77';
          }
          const amountLeft = cat.yearlyLimit - Math.abs(cat.total);
          const percentLeft = cat.yearlyLimit > 0 ? (amountLeft / cat.yearlyLimit) * 100 : 0;
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <CustomAvatar
                  size={44}
                  char={cat.category.name.charAt(0)}
                  shape="circle"
                  color={pickRandomByHash(cat.category.name, fluentColors)}
                />
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: tokens.colorNeutralForegroundOnBrand }}>{cat.category.name}</div>
                  <div style={{ fontSize: 13, color: tokens.colorNeutralForegroundOnBrand, opacity: 0.7 }}>
                    {percentLeft >= 0
                      ? `${percentLeft.toFixed(1)}% left`
                      : `${Math.abs(percentLeft).toFixed(1)}% overspent`}
                  </div>
                </div>
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