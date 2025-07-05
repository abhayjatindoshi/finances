import { LineChart } from '@fluentui/react-charts';
import { tokens } from '@fluentui/react-components';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import database from '../../../db/database';
import Category from '../../../db/models/Category';
import Tranasction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import { CategoryData, getBudgetData } from '../../../utils/DbUtils';

const paletteColors = [
  tokens.colorPaletteBlueBackground2,
  tokens.colorPalettePurpleBackground2,
  tokens.colorPaletteTealBackground2,
  tokens.colorPaletteGreenBackground2,
  tokens.colorPaletteCranberryBackground2,
  tokens.colorPalettePinkBackground2,
  tokens.colorPaletteRedBackground2,
  tokens.colorPaletteDarkOrangeBackground2,
  tokens.colorPaletteYellowBackground2,
  tokens.colorPaletteDarkRedBackground2,
  tokens.colorPaletteCornflowerBackground2,
  tokens.colorPaletteGoldBackground2,
  tokens.colorPaletteSeafoamBackground2,
];

const BudgetTrendsPage: React.FC = () => {
  const { tenantId } = useParams();
  const [budgetData, setBudgetData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Tranasction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      setLoading(true);
      try {
        const [data, , txs] = await Promise.all([
          getBudgetData(tenantId),
          database(tenantId).collections.get<Category>(TableName.Categories).query().fetch(),
          database(tenantId).collections.get<Tranasction>(TableName.Transactions).query().fetch(),
        ]);
        setBudgetData(data);
        setTransactions(txs);
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  // Find the first transaction date
  const sortedTxs = [...transactions].sort((a, b) => a.transactionAt.getTime() - b.transactionAt.getTime());
  const firstDate = sortedTxs.length > 0 ? new Date(sortedTxs[0].transactionAt.getFullYear(), sortedTxs[0].transactionAt.getMonth(), 1) : new Date(new Date().getFullYear(), 0, 1);
  // Always show 12 months starting from the first transaction month
  const monthTicks: Date[] = [];
  for (let i = 0; i < 12; i++) {
    monthTicks.push(new Date(firstDate.getFullYear(), firstDate.getMonth() + i, 1));
  }

  // For each category, build a line with y values for each month
  // Order categories by total spend (maximum first)
  const sortedBudgetData = [...budgetData].sort((a, b) => {
    const aTotal = monthTicks.reduce((sum, monthDate) => sum + Math.abs(a.monthlyTotal?.[monthDate.getMonth()] || 0), 0);
    const bTotal = monthTicks.reduce((sum, monthDate) => sum + Math.abs(b.monthlyTotal?.[monthDate.getMonth()] || 0), 0);
    return bTotal - aTotal;
  });
  const categoryLines = sortedBudgetData.map((cat, idx) => ({
    legend: cat.category.name,
    data: monthTicks.map((monthDate, i) => ({
      x: monthDate,
      y: Math.abs(cat.monthlyTotal?.[monthDate.getMonth()] || 0)
    })),
    color: paletteColors[idx % paletteColors.length] || tokens.colorBrandBackground,
  }));

  return (
    <div style={{ padding: 32, color: tokens.colorNeutralForegroundOnBrand, width: '100%', maxWidth: '100vw', margin: '0 auto' }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18 }}>Budget Trends</h2>
      <div style={{ background: tokens.colorNeutralBackground2, borderRadius: 18, boxShadow: '0 4px 24px #0002', padding: 32 }}>
        {loading ? (
          <div style={{ color: tokens.colorNeutralForeground3 }}>Loading trends...</div>
        ) : (
          <>
            <div style={{ width: '100%', minHeight: 420, position: 'relative', overflowX: 'auto' }}>
              <LineChart
                data={{ chartTitle: 'Budget Trends', lineChartData: categoryLines }}
                width={Math.max(900, monthTicks.length * 80)}
                height={340}
                yAxisTickFormat={(v: number) => `${Math.round(v)}`}
                legendProps={{
                  allowFocusOnLegends: true,
                }}
                // xAxisOptions not supported in this version
              />
            </div>
            <div style={{ marginTop: 8, color: tokens.colorNeutralForeground3, fontSize: 15 }}>
              <b>Tip:</b> Each line shows the monthly spend for a category. X-axis is months. Hover over the chart for details.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetTrendsPage; 