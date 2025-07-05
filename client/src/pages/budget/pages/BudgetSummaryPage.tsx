import { tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, withDialogTheme } from '../../../common/Dialog';
import { moneyFormat } from '../../../constants';
import database from '../../../db/database';
import Category, { CategoryType } from '../../../db/models/Category';
import SubCategory from '../../../db/models/SubCategory';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';

interface Alert {
  message: string;
  value: string | number;
  accent: string;
  icon: string;
}

interface AlertDetailData {
  title: string;
  categories?: CategoryData[];
  value?: number;
  prevAvg?: number;
  months?: number[];
}

const cardBaseStyle: React.CSSProperties = {
  background: 'linear-gradient(120deg, rgba(8,10,14,0.98) 0%, rgba(16,18,22,0.98) 100%)',
  backdropFilter: 'blur(2.5px)',
  WebkitBackdropFilter: 'blur(2.5px)',
  border: '1.5px solid rgba(255,255,255,0.10)',
  boxShadow: '0 4px 24px 0 #000c, 0 1.5px 8px #0008, inset 0 2.5px 12px #fff1, inset 0 -2.5px 12px #0003',
  borderRadius: 18,
  padding: 28,
  // minHeight: 120, // removed to avoid forcing card height
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  color: tokens.colorNeutralForegroundOnBrand,
  marginBottom: 24,
  transition: 'box-shadow 0.2s, transform 0.2s',
  cursor: 'default',
};

const cardHoverStyle: React.CSSProperties = {
  boxShadow: '0 8px 32px 0 #000e, 0 2px 12px #000a, inset 0 2.5px 12px #fff2, inset 0 -2.5px 12px #0004',
  transform: 'scale(1.025)',
};

const BudgetSummaryPage: React.FC = () => {
  const { tenantId } = useParams();
  const [budgetData, setBudgetData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);
  const [totalIncome, setTotalIncome] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alertDetailData, setAlertDetailData] = useState<AlertDetailData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      setLoading(true);
      try {
        const [data, categories, subCategories, transactions] = await Promise.all([
          getBudgetData(tenantId),
          database(tenantId).collections.get<Category>(TableName.Categories).query().fetch(),
          database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query().fetch(),
          database(tenantId).collections.get<Tranasction>(TableName.Transactions).query().fetch(),
        ]);
        setBudgetData(data);
        // Calculate total income
        const incomeCategoryIds = categories.filter(c => c.type === CategoryType.Income).map(c => c.id);
        const incomeSubCategoryIds = subCategories.filter(s => incomeCategoryIds.includes(s.category.id)).map(s => s.id);
        const totalIncomeCalc = transactions
          .filter(t => t.subCategory?.id && incomeSubCategoryIds.includes(t.subCategory.id))
          .reduce((total, t) => total + t.amount, 0);
        setTotalIncome(totalIncomeCalc);
      } catch (e) {
        // TODO: handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  const totalSpent = budgetData.reduce((sum, item) => sum + Math.abs(item.total), 0);
  const totalBudget = budgetData.reduce((sum, item) => sum + item.yearlyLimit, 0);
  const totalLeft = totalBudget - totalSpent;

  // --- ALERTS LOGIC ---
  // Helper functions
  const getCurrentMonth = () => new Date().getMonth();
  const currentMonth = getCurrentMonth();

  // Early return for no budget data
  if (budgetData.length === 0) {
    if (loading) {
      return <div style={{ padding: 32, color: '#fff' }}>Loading summary...</div>;
    }

    // Only show no data alert
    const alerts = [{
      message: 'No budget data available.',
      value: '',
      accent: '#60a5fa',
      icon: 'ℹ️',
    }];

    // Render early with only no data alert
    return (
      <div style={{
        padding: '32px 12px',
        display: 'flex',
        flexDirection: 'row',
        gap: 32,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <div style={{
          ...cardBaseStyle,
          flex: '0 1 360px',
        }}>
          <h2 style={{margin: 0, fontSize: 20, fontWeight: 700, marginBottom: 8}}>Alerts</h2>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            {alerts.map((alert, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(24,28,36,0.92)',
                borderRadius: 12,
                padding: '12px 16px',
                boxShadow: '0 2px 8px #0006',
                borderLeft: `4px solid ${alert.accent}`,
                fontSize: 15,
                fontWeight: 500,
                color: tokens.colorNeutralForegroundOnBrand,
                minHeight: 44,
                gap: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{fontSize: 22, marginRight: 2}}>{alert.icon}</span>
                  <span>{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Over budget categories
  const overBudgetCategories = budgetData.filter((item: CategoryData) => item.budgetPercentage >= 100);
  // Near budget categories (>=80% and <100%) - general overview alert
  const nearBudgetCategories = budgetData.filter((item: CategoryData) => item.budgetPercentage >= 80 && item.budgetPercentage < 100);
  // No budget set for category
  const noBudgetCategories = budgetData.filter((item: CategoryData) => item.yearlyLimit === 0);
  // No spending in category this month
  const noSpendingCategories = budgetData.filter((item: CategoryData) => {
    return (item.monthlyTotal?.[currentMonth] || 0) === 0 && item.yearlyLimit > 0;
  });
  // Unusual spend (current month > 2x average of previous months)
  const unusualSpendCategories = budgetData.filter((item: CategoryData) => {
    const monthlyTotals = Object.values(item.monthlyTotal || {}) as number[];
    if (monthlyTotals.length < 2) return false;
    const current = item.monthlyTotal?.[currentMonth] || 0;
    const prevAvg = monthlyTotals.slice(0, -1).reduce((a: number, b: number) => a + Math.abs(b), 0) / (monthlyTotals.length - 1);
    return Math.abs(current) > 2 * prevAvg && prevAvg > 0;
  });
  // Overspending trend (current month > last month)
  const overspendingTrendCategories = budgetData.filter((item: CategoryData) => {
    const lastMonth = item.monthlyTotal?.[currentMonth - 1] || 0;
    const current = item.monthlyTotal?.[currentMonth] || 0;
    return Math.abs(current) > Math.abs(lastMonth) && Math.abs(lastMonth) > 0;
  });
  // No income this month
  const noIncomeThisMonth = totalIncome === 0;
  // High income month (current month > 1.5x average of previous months)
  // (Assume income is positive in monthlyTotal for income categories)
  // For this, we need to fetch income categories' monthly totals
  // We'll sum all income category monthly totals for current and previous months
  const incomeMonthlyTotals: number[] = (() => {
    try {
      const incomeCats = budgetData.filter((item: CategoryData) => item.category.type === CategoryType.Income);
      return Array.from({ length: 12 }, (_, m) => incomeCats.reduce((sum: number, cat: CategoryData) => sum + (cat.monthlyTotal?.[m] || 0), 0));
    } catch (e) {
      // ignore
      return [];
    }
  })();
  const incomeCurrent = incomeMonthlyTotals[currentMonth] || 0;
  const incomePrevAvg = incomeMonthlyTotals.slice(0, currentMonth).length > 0
    ? incomeMonthlyTotals.slice(0, currentMonth).reduce((a, b) => a + b, 0) / incomeMonthlyTotals.slice(0, currentMonth).length
    : 0;
  const highIncomeMonth = incomeCurrent > 1.5 * incomePrevAvg && incomePrevAvg > 0;

  // --- ALERTS ARRAY ---
  const alerts = [
    ...(
      overBudgetCategories.length > 0
        ? [{
            message: `Over budget in ${overBudgetCategories.length} categor${overBudgetCategories.length > 1 ? 'ies' : 'y'}`,
            value: overBudgetCategories.length,
            accent: '#f87171',
            icon: '🚨',
          }]
        : []
    ),
    ...(
      nearBudgetCategories.length > 0
        ? [{
            message: `Close to budget in ${nearBudgetCategories.length} categor${nearBudgetCategories.length > 1 ? 'ies' : 'y'}`,
            value: nearBudgetCategories.length,
            accent: '#fbbf24',
            icon: '⚠️',
          }]
        : []
    ),
    ...(
      noBudgetCategories.length > 0
        ? [{
            message: `No budget set for ${noBudgetCategories.length} categor${noBudgetCategories.length > 1 ? 'ies' : 'y'}`,
            value: noBudgetCategories.length,
            accent: '#60a5fa',
            icon: 'ℹ️',
          }]
        : []
    ),
    ...(
      noSpendingCategories.length > 0
        ? [{
            message: `No spending in ${noSpendingCategories.length} categor${noSpendingCategories.length > 1 ? 'ies' : 'y'} this month`,
            value: noSpendingCategories.length,
            accent: '#60a5fa',
            icon: 'ℹ️',
          }]
        : []
    ),
    ...(
      unusualSpendCategories.length > 0
        ? [{
            message: `Unusual spend in ${unusualSpendCategories.length} categor${unusualSpendCategories.length > 1 ? 'ies' : 'y'}`,
            value: unusualSpendCategories.length,
            accent: '#f87171',
            icon: '🚨',
          }]
        : []
    ),
    ...(
      overspendingTrendCategories.length > 0
        ? [{
            message: `Spending is increasing in ${overspendingTrendCategories.length} categor${overspendingTrendCategories.length > 1 ? 'ies' : 'y'}`,
            value: overspendingTrendCategories.length,
            accent: '#fbbf24',
            icon: '⚡',
          }]
        : []
    ),
    ...(
      noIncomeThisMonth
        ? [{
            message: 'No income recorded this month.',
            value: '',
            accent: '#60a5fa',
            icon: 'ℹ️',
          }]
        : []
    ),
    ...(
      highIncomeMonth
        ? [{
            message: 'This month’s income is higher than usual.',
            value: moneyFormat.format(incomeCurrent),
            accent: '#60a5fa',
            icon: '💰',
          }]
        : []
    ),
  ];

  // Sort alerts by severity before rendering
  const severityOrder = (alert: { icon: string }) => {
    // Red/critical (🚨): 0, Yellow/orange/warning (⚠️/⚡): 1, Blue/info (ℹ️): 2, Positive (💰): 3
    if (alert.icon === '🚨') return 0;
    if (alert.icon === '⚠️' || alert.icon === '⚡') return 1;
    if (alert.icon === 'ℹ️') return 2;
    if (alert.icon === '💰') return 3;
    return 99;
  };
  const sortedAlerts = alerts.slice().sort((a, b) => severityOrder(a) - severityOrder(b));

  // Helper to get detail data for an alert
  const getAlertDetail = (alert: Alert): AlertDetailData | null => {
    // Match by message or icon/type
    if (!alert) return null;
    // Over budget
    if (alert.icon === '🚨' && alert.message.startsWith('Over budget')) {
      return {
        title: alert.message,
        categories: overBudgetCategories,
      };
    }
    // Near budget
    if (alert.icon === '⚠️' && alert.message.startsWith('Close to budget')) {
      return {
        title: alert.message,
        categories: nearBudgetCategories,
      };
    }
    // No budget set
    if (alert.icon === 'ℹ️' && alert.message.startsWith('No budget set')) {
      return {
        title: alert.message,
        categories: noBudgetCategories,
      };
    }
    // No spending
    if (alert.icon === 'ℹ️' && alert.message.startsWith('No spending')) {
      return {
        title: alert.message,
        categories: noSpendingCategories,
      };
    }
    // Unusual spend
    if (alert.icon === '🚨' && alert.message.startsWith('Unusual spend')) {
      return {
        title: alert.message,
        categories: unusualSpendCategories,
      };
    }
    // Overspending trend
    if (alert.icon === '⚡') {
      return {
        title: alert.message,
        categories: overspendingTrendCategories,
      };
    }
    // No income
    if (alert.icon === 'ℹ️' && alert.message.startsWith('No income')) {
      return {
        title: alert.message,
        categories: [],
      };
    }
    // High income
    if (alert.icon === '💰') {
      return {
        title: alert.message,
        value: incomeCurrent,
        prevAvg: incomePrevAvg,
        months: incomeMonthlyTotals,
      };
    }
    return { title: alert.message };
  };

  if (loading) {
    return <div style={{ padding: 32, color: '#fff' }}>Loading summary...</div>;
  }

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
      <div
        style={{
          ...cardBaseStyle,
          ...(hovered === 'summary' ? cardHoverStyle : {}),
          flex: '0 1 360px',
        }}
        onMouseEnter={() => setHovered('summary')}
        onMouseLeave={() => setHovered(null)}
      >
        <h2 style={{margin: 0, fontSize: 22, fontWeight: 700}}>Budget Overview</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 16}}>
          <div>
            <div style={{fontSize: 14, opacity: 0.7}}>Total Income</div>
            <div style={{fontSize: 20, fontWeight: 600, color: '#60a5fa'}}>{moneyFormat.format(totalIncome)}</div>
          </div>
          <div>
            <div style={{fontSize: 14, opacity: 0.7}}>Total Budget</div>
            <div style={{fontSize: 20, fontWeight: 600}}>{moneyFormat.format(totalBudget)}</div>
          </div>
          <div>
            <div style={{fontSize: 14, opacity: 0.7}}>Spent</div>
            <div style={{fontSize: 20, fontWeight: 600, color: '#f87171'}}>{moneyFormat.format(totalSpent)}</div>
          </div>
          <div>
            <div style={{fontSize: 14, opacity: 0.7}}>Left</div>
            <div style={{fontSize: 20, fontWeight: 600, color: '#34d399'}}>{moneyFormat.format(totalLeft)}</div>
          </div>
        </div>
      </div>

      {/* Block 2: Alerts as notifications */}
      <div
        style={{
          ...cardBaseStyle,
          ...(hovered === 'alerts' ? cardHoverStyle : {}),
          flex: '0 1 360px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
        onMouseEnter={() => setHovered('alerts')}
        onMouseLeave={() => setHovered(null)}
      >
        <h2 style={{margin: 0, fontSize: 20, fontWeight: 700, marginBottom: 8}}>Alerts</h2>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {sortedAlerts.length === 0 && (
            <div style={{ color: tokens.colorNeutralForeground3, fontSize: 15, padding: '12px 0' }}>No alerts</div>
          )}
          {sortedAlerts.map((alert, idx) => (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(24,28,36,0.92)',
              borderRadius: 12,
              padding: '12px 16px',
              boxShadow: '0 2px 8px #0006',
              borderLeft: `4px solid ${alert.accent}`,
              fontSize: 15,
              fontWeight: 500,
              color: tokens.colorNeutralForegroundOnBrand,
              minHeight: 44,
              gap: 14,
              cursor: 'pointer',
            }}
            onClick={() => {
              const detail = getAlertDetail(alert);
              setSelectedAlert(alert);
              setAlertDetailData(detail);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{fontSize: 22, marginRight: 2}}>{alert.icon}</span>
              <span>{alert.message}</span>
            </div>
            {alert.value && (
              <span style={{ fontSize: 22, fontWeight: 700, color: alert.accent, minWidth: 48, textAlign: 'right' }}>{alert.value}</span>
            )}
          </div>
          ))}
        </div>
      </div>

      {/* Dialog for alert details */}
      {withDialogTheme(
        <Dialog open={!!selectedAlert} onOpenChange={(_e: unknown, data: { open: boolean }) => { if (!data.open) { setSelectedAlert(null); setAlertDetailData(null); } }}>
          <DialogSurface>
            <DialogBody>
              <DialogContent>
                {alertDetailData && (
                  <div style={{ minWidth: 340, color: tokens.colorNeutralForegroundOnBrand, padding: 8 }}>
                    <div style={{
                      fontSize: 22,
                      fontWeight: 700,
                      marginBottom: 12,
                      color: tokens.colorBrandForeground1,
                      letterSpacing: 0.2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10
                    }}>
                      <span style={{ fontSize: 28 }}>{selectedAlert?.icon}</span>
                      <span>{alertDetailData.title}</span>
                    </div>
                    {/* Category-based details */}
                    {alertDetailData.categories && alertDetailData.categories.length > 0 && (
                      <div style={{
                        background: tokens.colorNeutralBackground2,
                        borderRadius: 10,
                        padding: 14,
                        marginBottom: 18,
                        boxShadow: '0 2px 8px #0002',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 10, color: tokens.colorBrandForeground2, fontSize: 16 }}>Affected Categories</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                          <thead>
                            <tr style={{ color: tokens.colorNeutralForeground3, fontWeight: 500 }}>
                              <th style={{ textAlign: 'left', paddingBottom: 6 }}>Category</th>
                              <th style={{ textAlign: 'right', paddingBottom: 6 }}>Spent</th>
                              <th style={{ textAlign: 'right', paddingBottom: 6 }}>Budget</th>
                              <th style={{ textAlign: 'right', paddingBottom: 6 }}>Left</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alertDetailData.categories?.map((cat: CategoryData) => (
                              <tr key={cat.category.id} style={{ borderTop: '1px solid #2224' }}>
                                <td style={{ padding: '4px 0', fontWeight: 500 }}>{cat.category.name}</td>
                                <td style={{ textAlign: 'right', color: '#f87171', fontWeight: 600 }}>{moneyFormat.format(cat.total)}</td>
                                <td style={{ textAlign: 'right', color: '#60a5fa', fontWeight: 600 }}>{moneyFormat.format(cat.yearlyLimit)}</td>
                                <td style={{ textAlign: 'right', color: '#34d399', fontWeight: 600 }}>{cat.yearlyLimit > 0 ? moneyFormat.format(cat.yearlyLimit - Math.abs(cat.total)) : '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {/* High income detail */}
                    {alertDetailData.value !== undefined && (
                      <div style={{
                        background: tokens.colorNeutralBackground2,
                        borderRadius: 10,
                        padding: 14,
                        marginBottom: 18,
                        boxShadow: '0 2px 8px #0002',
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: 10, color: tokens.colorBrandForeground2, fontSize: 16 }}>Income Details</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>This month:</span>
                          <span style={{ fontWeight: 700, color: tokens.colorBrandForeground1 }}>{moneyFormat.format(alertDetailData.value || 0)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span>Previous avg:</span>
                          <span style={{ fontWeight: 700, color: tokens.colorNeutralForeground3 }}>{moneyFormat.format(alertDetailData.prevAvg || 0)}</span>
                        </div>
                        <div style={{ marginTop: 10 }}>
                          <div style={{ fontWeight: 500, marginBottom: 6 }}>Monthly Income (last 12 months):</div>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 6,
                            fontSize: 14
                          }}>
                            {alertDetailData.months && alertDetailData.months.map((amt: number, i: number) => (
                              <div key={i} style={{
                                background: 'rgba(96,165,250,0.08)',
                                borderRadius: 6,
                                padding: '4px 8px',
                                textAlign: 'center',
                                color: tokens.colorBrandForeground2
                              }}>
                                <div style={{ fontWeight: 500 }}>{new Date(0, i).toLocaleString('default', { month: 'short' })}</div>
                                <div>{moneyFormat.format(amt)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Fallback for no details */}
                    {!alertDetailData.categories && alertDetailData.value === undefined && (
                      <div style={{ color: tokens.colorNeutralForeground3, padding: 12, textAlign: 'center' }}>No further details available.</div>
                    )}
                  </div>
                )}
              </DialogContent>
              <DialogActions>
                <button onClick={() => { setSelectedAlert(null); setAlertDetailData(null); }} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: tokens.colorBrandBackground, color: tokens.colorBrandForeground1, fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>Close</button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}

      {/* TODO: Add more blocks for insights, trends, or quick actions */}
    </div>
  );
};

export default BudgetSummaryPage; 