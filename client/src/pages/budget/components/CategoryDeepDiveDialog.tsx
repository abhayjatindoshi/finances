import { Button, Text, tokens, Tooltip } from '@fluentui/react-components';
import { ArrowDownFilled, ArrowUpFilled, DismissRegular } from '@fluentui/react-icons';
import React, { useEffect, useState } from 'react';
import CustomAvatar from '../../../common/CustomAvatar';
import Money from '../../../common/Money';
import { fluentColors, moneyFormat } from '../../../constants';
import database from '../../../db/database';
import SubCategory from '../../../db/models/SubCategory';
import TableName from '../../../db/TableName';
import { pickRandomByHash } from '../../../utils/Common';
import { CategoryData } from '../../../utils/DbUtils';

interface CategoryDeepDiveDialogProps {
  category: CategoryData | null;
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
}

const CategoryDeepDiveDialog: React.FC<CategoryDeepDiveDialogProps> = ({
  category,
  isOpen,
  onClose,
  tenantId,
}) => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (tenantId && isOpen) {
        const subCats = await database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query().fetch();
        setSubCategories(subCats);
      }
    };
    fetchSubCategories();
  }, [tenantId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 200); // Wait for animation to complete
  };

  if (!category) return null;

  const { transactions } = category;
  
  // Group transactions by sub-category with withdrawals and deposits
  const subCategoryData: Record<string, { name: string; withdrawals: number; deposits: number; net: number }> = {};
  transactions.forEach(t => {
    const subCat = t.subCategory?.id 
      ? subCategories.find(s => s.id === t.subCategory?.id)
      : null;
    const subCatName = subCat?.name || 'Uncategorized';
    const subCatId = subCat?.id || 'uncategorized';
    
    if (!subCategoryData[subCatId]) {
      subCategoryData[subCatId] = { name: subCatName, withdrawals: 0, deposits: 0, net: 0 };
    }
    
    if (t.amount < 0) {
      subCategoryData[subCatId].withdrawals += Math.abs(t.amount);
    } else {
      subCategoryData[subCatId].deposits += t.amount;
    }
    subCategoryData[subCatId].net += t.amount;
  });

  // Calculate monthly data with withdrawals and deposits
  const monthlyData: Record<number, { withdrawals: number; deposits: number; net: number }> = {};
  transactions.forEach(t => {
    const month = new Date(t.transactionAt).getMonth();
    if (!monthlyData[month]) {
      monthlyData[month] = { withdrawals: 0, deposits: 0, net: 0 };
    }
    
    if (t.amount < 0) {
      monthlyData[month].withdrawals += Math.abs(t.amount);
    } else {
      monthlyData[month].deposits += t.amount;
    }
    monthlyData[month].net += t.amount;
  });

  // Calculate progress for color matching
  const progress = category.yearlyLimit > 0 ? Math.abs(category.total) / category.yearlyLimit : 0;
  
  // Color scale logic matching the main cards
  let baseColor: string;
  if (progress * 100 > 100) {
    baseColor = '#ff4444'; // Changed from dark red to brighter red for better visibility
  } else if (progress * 100 >= 80) {
    baseColor = '#ff8c42'; // True orange - more distinct from yellow
  } else if (progress * 100 >= 60) {
    baseColor = '#ffe156';
  } else {
    baseColor = '#3cff7a';
  }

  // Monthly spends
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            opacity: isAnimating ? 1 : 0,
            transition: 'opacity 200ms ease-in-out',
          }}
          onClick={handleClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '800px',
              width: '90vw',
              maxHeight: '85vh',
              background: `
                linear-gradient(120deg, rgba(8,10,14,0.95) 0%, rgba(16,18,22,0.95) 100%),
                repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 16px),
                radial-gradient(ellipse at 60% 20%, ${baseColor}11 0%, #181c2400 80%)
              `,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1.5px solid ${baseColor}30`,
              boxShadow: `
                0 8px 32px 0 #000e, 
                0 4px 16px #000a, 
                inset 0 2px 8px ${baseColor}20, 
                inset 0 -2px 8px #0003
              `,
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
              opacity: isAnimating ? 1 : 0,
              transition: 'all 200ms ease-out',
            }}
          >
        {/* Glowing Background Circles */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}>
          {/* Large primary glow */}
          <div style={{
            position: 'absolute',
            top: '15%',
            right: '10%',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${baseColor}15 0%, ${baseColor}08 40%, transparent 70%)`,
            boxShadow: `0 0 60px 20px ${baseColor}12`,
            animation: 'pulse 4s ease-in-out infinite alternate',
          }} />
          
          {/* Medium secondary glow */}
          <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '15%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${baseColor}12 0%, ${baseColor}06 50%, transparent 80%)`,
            boxShadow: `0 0 40px 15px ${baseColor}10`,
            animation: 'pulse 3s ease-in-out infinite alternate reverse',
          }} />
          
          {/* Small accent glow */}
          <div style={{
            position: 'absolute',
            top: '60%',
            right: '25%',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${baseColor}10 0%, ${baseColor}04 60%, transparent 90%)`,
            boxShadow: `0 0 30px 10px ${baseColor}08`,
            animation: 'pulse 5s ease-in-out infinite alternate',
          }} />
          
          {/* Tiny ambient glow */}
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '75%',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${baseColor}08 0%, ${baseColor}03 70%, transparent 100%)`,
            boxShadow: `0 0 20px 8px ${baseColor}06`,
            animation: 'pulse 2.5s ease-in-out infinite alternate reverse',
          }} />
        </div>

        {/* Add CSS keyframes for the animation */}
        <style>{`
          @keyframes pulse {
            0% {
              transform: scale(0.95);
              opacity: 0.7;
            }
            100% {
              transform: scale(1.05);
              opacity: 1;
            }
          }
        `}</style>
        
        {/* Header */}
        <div
          style={{
            background: `
              linear-gradient(90deg, ${baseColor}15 0%, transparent 100%),
              rgba(8,10,14,0.8)
            `,
            borderBottom: `1px solid ${baseColor}30`,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexShrink: 0,
          }}
        >
          <CustomAvatar
            size={48}
            char={category.category.name.charAt(0)}
            shape="circle"
            color={pickRandomByHash(category.category.name, fluentColors)}
          />
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              color: tokens.colorNeutralForegroundOnBrand,
              textShadow: `0 2px 8px ${baseColor}40`
            }}>
              {category.category.name}
            </h2>
            <Text size={300} style={{ color: tokens.colorNeutralForegroundOnBrand, opacity: 0.8 }}>
              Deep Dive Analysis
            </Text>
          </div>
          <Button
            appearance="subtle"
            icon={<DismissRegular />}
            onClick={handleClose}
            style={{
              color: tokens.colorNeutralForegroundOnBrand,
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: '12px',
            }}
          />
        </div>
        
        <div
          style={{
            padding: '24px',
            maxHeight: '60vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: `${baseColor}60 transparent`,
            flex: 1,
          }}
        >
          <div>
            {/* Overall Stats */}
            <div style={{ 
              marginBottom: '32px',
              padding: '20px',
              background: `
                linear-gradient(135deg, ${baseColor}10 0%, transparent 100%),
                rgba(8,10,14,0.6)
              `,
              borderRadius: '16px',
              border: `1px solid ${baseColor}20`,
            }}>
              <Text 
                as="h3" 
                size={500} 
                weight="semibold" 
                style={{ 
                  marginBottom: '16px', 
                  color: tokens.colorNeutralForegroundOnBrand,
                  display: 'block'
                }}
              >
                Overall Statistics
              </Text>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '16px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: tokens.colorNeutralForegroundOnBrand 
                  }}>
                    <Money amount={Math.abs(category.total)} />
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: tokens.colorNeutralForegroundOnBrand, 
                    opacity: 0.7 
                  }}>
                    Total Spent
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: tokens.colorNeutralForegroundOnBrand 
                  }}>
                    <Money amount={category.yearlyLimit} />
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: tokens.colorNeutralForegroundOnBrand, 
                    opacity: 0.7 
                  }}>
                    Yearly Budget
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: baseColor 
                  }}>
                    {(progress * 100).toFixed(1)}%
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: tokens.colorNeutralForegroundOnBrand, 
                    opacity: 0.7 
                  }}>
                    Budget Used
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-Category Breakdown */}
            <div style={{ marginBottom: '32px' }}>
              <Text 
                as="h3" 
                size={500} 
                weight="semibold" 
                style={{ 
                  marginBottom: '16px', 
                  color: tokens.colorNeutralForegroundOnBrand,
                  display: 'block'
                }}
              >
                Sub-Category Breakdown
              </Text>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '12px'
              }}>
                {Object.values(subCategoryData).map(sub => (
                  <div
                    key={sub.name}
                    style={{
                      padding: '16px',
                      background: `
                        linear-gradient(135deg, ${baseColor}08 0%, transparent 100%),
                        rgba(8,10,14,0.4)
                      `,
                      borderRadius: '12px',
                      border: `1px solid ${baseColor}15`,
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <div style={{ 
                      fontWeight: '600', 
                      fontSize: '14px',
                      color: tokens.colorNeutralForegroundOnBrand,
                      marginBottom: '12px'
                    }}>
                      {sub.name}
                    </div>
                    
                    {/* Net Amount with tooltip showing breakdown */}
                    <Tooltip
                      content={
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {sub.withdrawals > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b' }}>
                              <ArrowDownFilled style={{ fontSize: '12px' }} />
                              <span>Withdrawals: {moneyFormat.format(sub.withdrawals)}</span>
                            </div>
                          )}
                          {sub.deposits > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#51cf66' }}>
                              <ArrowUpFilled style={{ fontSize: '12px' }} />
                              <span>Deposits: {moneyFormat.format(sub.deposits)}</span>
                            </div>
                          )}
                        </div>
                      }
                      relationship="description"
                    >
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: '700',
                        color: sub.net >= 0 ? '#3cff7a' : baseColor,
                        cursor: 'help',
                        textAlign: 'center'
                      }}>
                        <Money amount={sub.net} />
                      </div>
                    </Tooltip>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div>
              <Text 
                as="h3" 
                size={500} 
                weight="semibold" 
                style={{ 
                  marginBottom: '16px', 
                  color: tokens.colorNeutralForegroundOnBrand,
                  display: 'block'
                }}
              >
                Monthly Breakdown
              </Text>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '8px'
              }}>
                {months.map(month => {
                  const monthData = monthlyData[month] || { withdrawals: 0, deposits: 0, net: 0 };
                  return (
                    <div
                      key={month}
                      style={{
                        padding: '12px',
                        background: `
                          linear-gradient(135deg, ${baseColor}06 0%, transparent 100%),
                          rgba(8,10,14,0.3)
                        `,
                        borderRadius: '10px',
                        border: `1px solid ${baseColor}10`,
                        backdropFilter: 'blur(2px)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ 
                        fontWeight: '500', 
                        fontSize: '12px',
                        color: tokens.colorNeutralForegroundOnBrand,
                        opacity: 0.8,
                        marginBottom: '6px'
                      }}>
                        {new Date(0, month).toLocaleString('default', { month: 'short' })}
                      </div>
                      
                      {/* Net Amount with tooltip showing breakdown */}
                      <Tooltip
                        content={
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {monthData.withdrawals > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#ff6b6b' }}>
                                <ArrowDownFilled style={{ fontSize: '12px' }} />
                                <span>Withdrawals: {moneyFormat.format(monthData.withdrawals)}</span>
                              </div>
                            )}
                            {monthData.deposits > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#51cf66' }}>
                                <ArrowUpFilled style={{ fontSize: '12px' }} />
                                <span>Deposits: {moneyFormat.format(monthData.deposits)}</span>
                              </div>
                            )}
                          </div>
                        }
                        relationship="description"
                      >
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '700',
                          color: monthData.net >= 0 ? '#3cff7a' : baseColor,
                          cursor: monthData.withdrawals > 0 || monthData.deposits > 0 ? 'help' : 'default'
                        }}>
                          <Money amount={monthData.net} />
                        </div>
                      </Tooltip>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryDeepDiveDialog;
