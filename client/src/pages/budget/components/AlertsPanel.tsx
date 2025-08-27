
import { tokens } from '@fluentui/react-components';
import React from 'react';
import { moneyFormat } from '../../../constants';
import { CategoryType } from '../../../db/models/Category';

type CategoryData = {
  category: { id: string; name: string; type: string };
  total: number;
  yearlyLimit: number;
  budgetPercentage: number;
  monthlyTotal?: { [month: number]: number };
};

type Props = {
  hovered: string | null;
  setHovered: (v: string | null) => void;
  cardBaseStyle: React.CSSProperties;
  cardHoverStyle: React.CSSProperties;
  budgetData: CategoryData[];
  loading: boolean;
};

const AlertsPanel: React.FC<Props> = ({ hovered, setHovered, cardBaseStyle, cardHoverStyle, budgetData, loading }) => {
  const getCurrentMonth = () => new Date().getMonth();
  const currentMonth = getCurrentMonth();

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
    return (
      <div style={{
        ...cardBaseStyle,
        flex: '0 1 360px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
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
  const noIncomeThisMonth = (() => {
    try {
      const incomeCats = budgetData.filter((item: CategoryData) => item.category.type === CategoryType.Income);
      const monthSum = incomeCats.reduce((sum: number, cat: CategoryData) => sum + (cat.monthlyTotal?.[currentMonth] || 0), 0);
      return monthSum === 0;
    } catch {
      return false;
    }
  })();
  // High income month (current month > 1.5x average of previous months)
  const incomeMonthlyTotals: number[] = (() => {
    try {
      const incomeCats = budgetData.filter((item: CategoryData) => item.category.type === CategoryType.Income);
      return Array.from({ length: 12 }, (_, m) => incomeCats.reduce((sum: number, cat: CategoryData) => sum + (cat.monthlyTotal?.[m] || 0), 0));
    } catch {
      return Array(12).fill(0);
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

  const severityOrder = (alert: { icon: string }) => {
    if (alert.icon === '🚨') return 0;
    if (alert.icon === '⚠️' || alert.icon === '⚡') return 1;
    if (alert.icon === 'ℹ️') return 2;
    if (alert.icon === '💰') return 3;
    return 99;
  };
  const sortedAlerts = alerts.slice().sort((a, b) => severityOrder(a) - severityOrder(b));

  return (
    <div
      style={{
        ...cardBaseStyle,
        ...(hovered === 'alerts' ? cardHoverStyle : {}),
        flex: '0 1 360px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px',
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
  );
};

export default AlertsPanel;
