import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTitle, Tab, TabList, TabValue, makeStyles } from '@fluentui/react-components';
import {
  AddRegular,
  AlertRegular,
  CalendarRegular,
  ChevronLeftRegular,
  DataPieRegular,
  MoneyRegular,
  ReceiptRegular
} from '@fluentui/react-icons';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomAvatar from '../common/CustomAvatar';
import Money from '../common/Money';
import { fluentColors } from '../constants';
import database from '../db/database';
import SubCategory from '../db/models/SubCategory';
import TableName from '../db/TableName';
import { pickRandomByHash } from '../utils/Common';
import { CategoryData, getBudgetData } from '../utils/DbUtils';

const useStyles = makeStyles({
  container: {
    padding: '24px',
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'var(--colorNeutralBackground1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'var(--colorNeutralForeground1)',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--colorNeutralForeground3)',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    border: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    minHeight: '120px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 24px var(--colorNeutralShadowAmbient), 0 6px 12px var(--colorNeutralShadowKey)',
    }
  },
  statCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
    transition: 'opacity 0.3s ease',
  },
  statCardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'var(--colorNeutralForegroundOnBrand)',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '14px',
    color: 'var(--colorNeutralForegroundOnBrand)',
    opacity: 0.9,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  categoryCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '20px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 24px var(--colorNeutralShadowAmbient), 0 6px 12px var(--colorNeutralShadowKey)',
    }
  },
  categoryCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
    transition: 'opacity 0.3s ease',
  },
  categoryCardContent: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  categoryName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--colorNeutralForegroundOnBrand)',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
    position: 'relative',
  },
  categoryStats: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  amount: {
    fontWeight: '600',
    color: 'var(--colorNeutralForegroundOnBrand)',
  },
  percentage: {
    color: 'var(--colorNeutralForegroundOnBrand)',
    opacity: 0.8,
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  actionButton: {
    flex: 1,
  },
  alertCard: {
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    position: 'relative',
    overflow: 'hidden',
  },
  alertCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  alertCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  alertHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  alertTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: 'var(--colorNeutralForegroundOnBrand)',
  },
  alertMessage: {
    fontSize: '14px',
    color: 'var(--colorNeutralForegroundOnBrand)',
    opacity: 0.9,
  },
  filters: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchInput: {
    flex: 1,
    minWidth: '200px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '16px',
    color: 'var(--colorNeutralForeground3)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: 'var(--colorNeutralForeground3)',
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  detailStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  detailStat: {
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    border: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px var(--colorNeutralShadowAmbient), 0 4px 8px var(--colorNeutralShadowKey)',
    }
  },
  detailStatGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  detailStatContent: {
    position: 'relative',
    zIndex: 1,
  },
  detailStatValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'var(--colorNeutralForegroundOnBrand)',
    marginBottom: '4px',
  },
  detailStatLabel: {
    fontSize: '12px',
    color: 'var(--colorNeutralForegroundOnBrand)',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  monthlyBreakdown: {
    marginBottom: '24px',
  },
  monthGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  monthCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '12px',
    border: 'none',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 8px 16px var(--colorNeutralShadowAmbient), 0 4px 8px var(--colorNeutralShadowKey)',
    }
  },
  monthCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  monthCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  monthName: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--colorNeutralForegroundOnBrand)',
    marginBottom: '4px',
  },
  monthAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--colorNeutralForegroundOnBrand)',
  },
  monthPercentage: {
    fontSize: '10px',
    color: 'var(--colorNeutralForegroundOnBrand)',
    opacity: 0.8,
    marginTop: '2px',
  },
  transactionsList: {
    maxHeight: '300px',
    overflow: 'auto',
  },
  transactionItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderBottom: '1px solid var(--colorNeutralStroke3)',
    transition: 'all 0.2s ease',
  },
  transactionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  transactionDate: {
    fontSize: '12px',
    color: 'var(--colorNeutralForeground3)',
  },
  transactionTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--colorNeutralForeground1)',
  },
  transactionAmount: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--colorNeutralForeground1)',
  },
  insightCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '20px',
    border: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px var(--colorNeutralShadowAmbient), 0 4px 8px var(--colorNeutralShadowKey)',
    }
  },
  insightCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  insightCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  topSubCategoryCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    border: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px var(--colorNeutralShadowAmbient), 0 4px 8px var(--colorNeutralShadowKey)',
    }
  },
  topSubCategoryCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  topSubCategoryCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  rankBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    zIndex: 2,
  },
  growthCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '20px',
    border: 'none',
    overflow: 'hidden',
  },
  growthCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  growthCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  recommendationCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '20px',
    border: 'none',
    overflow: 'hidden',
  },
  recommendationCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  recommendationCardContent: {
    position: 'relative',
    zIndex: 1,
  },
  budgetStatusCard: {
    position: 'relative',
    borderRadius: '12px',
    padding: '16px',
    border: 'none',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 16px var(--colorNeutralShadowAmbient), 0 4px 8px var(--colorNeutralShadowKey)',
    }
  },
  budgetStatusCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '12px',
    opacity: 0.9,
  },
  budgetStatusCardContent: {
    position: 'relative',
    zIndex: 1,
  },
});

const BudgetPage: React.FC = () => {

  const navigate = useNavigate();
  const { tenantId } = useParams();
  const styles = useStyles();
  
  const [selectedTab, setSelectedTab] = useState<TabValue>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [budgetData, setBudgetData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenantId) return;
      try {
        setLoading(true);
        const [data, subCats] = await Promise.all([
          getBudgetData(tenantId),
          database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query().fetch()
        ]);
        setBudgetData(data);
        setSubCategories(subCats);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  const handleBack = () => {
    navigate(`/tenants/${tenantId}/dashboard`);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) {
      return 'var(--colorStatusDangerBackground1)';
    } else if (percentage >= 80) {
      return 'var(--colorStatusWarningBackground1)';
    } else {
      return 'var(--colorStatusSuccessBackground1)';
    }
  };



  const getStatusType = (percentage: number) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'normal';
  };

  const handleViewDetails = (categoryData: CategoryData) => {
    setSelectedCategory(categoryData);
    setDetailModalOpen(true);
  };

  // Calculate summary statistics
  const totalSpent = budgetData.reduce((sum, item) => sum + Math.abs(item.total), 0);
  const totalBudget = budgetData.reduce((sum, item) => sum + item.yearlyLimit, 0);
  const remainingBudget = totalBudget - totalSpent;
  const overspentCategories = budgetData.filter(item => item.budgetPercentage >= 100).length;

  const onTrackCategories = budgetData.filter(item => item.budgetPercentage < 80).length;

  const filteredCategories = budgetData.filter(category => {
    const matchesSearch = category.category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryStatus = getStatusType(category.budgetPercentage);
    const matchesStatus = selectedStatus === 'all' || categoryStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getMonthName = (monthIndex: number) => {
    return moment().month(monthIndex).format('MMM');
  };

  const getMonthlyLimit = (categoryData: CategoryData) => {
    return categoryData.category.monthlyLimit > 0 
      ? categoryData.category.monthlyLimit 
      : categoryData.category.yearlyLimit / 12;
  };

  // --- Trends Tab Data ---
  // Monthly total spending (array of 12 months)
  const monthlyTotals = Array.from({ length: 12 }, (_, monthIdx) =>
    budgetData.reduce((sum, cat) => sum + Math.abs(cat.monthlyTotal[monthIdx] || 0), 0)
  );

  // Donut chart data for category breakdown (current year)
  const donutChartData = budgetData.map(cat => ({
    label: cat.category.name,
    value: Math.abs(cat.total),
    color: pickRandomByHash(cat.category.name, fluentColors),
  }));
  const donutTotal = donutChartData.reduce((sum, d) => sum + d.value, 0);
  const donutSegments = donutChartData.map((d, i) => {
    const prev = donutChartData.slice(0, i).reduce((sum, d) => sum + d.value, 0);
    const startAngle = (prev / donutTotal) * 2 * Math.PI;
    const endAngle = ((prev + d.value) / donutTotal) * 2 * Math.PI;
    const x1 = 100 + 80 * Math.cos(startAngle - Math.PI / 2);
    const y1 = 100 + 80 * Math.sin(startAngle - Math.PI / 2);
    const x2 = 100 + 80 * Math.cos(endAngle - Math.PI / 2);
    const y2 = 100 + 80 * Math.sin(endAngle - Math.PI / 2);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = `M100,100 L${x1},${y1} A80,80 0 ${largeArc} 1 ${x2},${y2} Z`;
    return { path, color: d.color, label: d.label, value: d.value };
  });

  // --- Insights Tab Data ---
  // 1. Fastest growing category (highest % increase from first to last month)
  const growthRates = budgetData.map(cat => {
    const first = Math.abs(cat.monthlyTotal[0] || 0);
    const last = Math.abs(cat.monthlyTotal[11] || 0);
    const growth = first > 0 ? ((last - first) / first) * 100 : (last > 0 ? 100 : 0);
    return { name: cat.category.name, growth };
  });
  const fastestGrowing = growthRates.reduce((max, curr) => curr.growth > max.growth ? curr : max, { name: '', growth: -Infinity });

  // 2. Most over budget
  const mostOverBudget = budgetData.reduce((max, cat) => (cat.budgetPercentage > (max?.budgetPercentage || 0) ? cat : max), null as CategoryData | null);

  // 3. Highest spending month
  const highestMonthIdx = monthlyTotals.reduce((maxIdx, val, idx, arr) => val > arr[maxIdx] ? idx : maxIdx, 0);
  const highestMonthName = getMonthName(highestMonthIdx);

  // 4. Sub-category analysis
  const subCategoryAnalysis = budgetData.flatMap(catData => 
    catData.transactions.map(transaction => {
      const subCategory = transaction.subCategory?.id 
        ? subCategories.find(s => s.id === transaction.subCategory?.id)
        : null;
      return {
        categoryName: catData.category.name,
        subCategoryName: subCategory?.name || 'Uncategorized',
        amount: Math.abs(transaction.amount),
        date: typeof transaction.transactionAt === 'string' ? transaction.transactionAt : transaction.transactionAt.toISOString(),
        transactionTitle: transaction.title
      };
    })
  );

  // 5. Top sub-categories by total spending
  const subCategoryTotals = subCategoryAnalysis.reduce((acc, item) => {
    const key = `${item.categoryName} > ${item.subCategoryName}`;
    if (!acc[key]) {
      acc[key] = {
        categoryName: item.categoryName,
        subCategoryName: item.subCategoryName,
        total: 0,
        transactionCount: 0,
        transactions: []
      };
    }
    acc[key].total += item.amount;
    acc[key].transactionCount += 1;
    acc[key].transactions.push(item);
    return acc;
  }, {} as Record<string, {
    subCategoryName: string;
    categoryName: string;
    total: number;
    transactionCount: number;
    transactions: Array<{ date: string; amount: number }>;
  }>);

  const topSubCategories = Object.values(subCategoryTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // 6. Sub-category growth analysis
  const subCategoryGrowth = Object.values(subCategoryTotals).map(subCat => {
    const monthlyData = Array.from({ length: 12 }, (_, month) => 
      subCat.transactions
        .filter((t: { date: string }) => new Date(t.date).getMonth() === month)
        .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0)
    );
    const firstMonth = monthlyData[0];
    const lastMonth = monthlyData[11];
    const growth = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : (lastMonth > 0 ? 100 : 0);
    return {
      ...subCat,
      growth,
      monthlyData
    };
  });

  const fastestGrowingSubCategory = subCategoryGrowth.reduce((max, curr) => 
    curr.growth > max.growth ? curr : max, 
    { growth: -Infinity, subCategoryName: '', categoryName: '' }
  );

  // 7. Spending pattern analysis
  const averageTransactionAmount = subCategoryAnalysis.length > 0 
    ? subCategoryAnalysis.reduce((sum, item) => sum + item.amount, 0) / subCategoryAnalysis.length 
    : 0;

  const highestTransaction = subCategoryAnalysis.reduce((max, item) => 
    item.amount > max.amount ? item : max, 
    { amount: 0, transactionTitle: '', categoryName: '', subCategoryName: '' }
  );

  // 8. Category efficiency (spending vs budget)
  const categoryEfficiency = budgetData.map(cat => ({
    name: cat.category.name,
    efficiency: cat.yearlyLimit > 0 ? (Math.abs(cat.total) / cat.yearlyLimit) * 100 : 0,
    remainingBudget: cat.yearlyLimit - Math.abs(cat.total),
    isOverBudget: cat.budgetPercentage >= 100
  }));

  const mostEfficientCategory = categoryEfficiency
    .filter(cat => !cat.isOverBudget)
    .reduce((min, curr) => curr.efficiency < min.efficiency ? curr : min, 
      { efficiency: Infinity, name: '' }
    );

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <Button 
            appearance="subtle" 
            icon={<ChevronLeftRegular />}
            onClick={handleBack}
          />
          <div>
            <h1 className={styles.title}>Budget Dashboard</h1>
            <p className={styles.subtitle}>Track your spending and stay on budget</p>
          </div>
        </div>
        <div className={styles.loading}>Loading budget data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Button 
          appearance="subtle" 
          icon={<ChevronLeftRegular />}
          onClick={handleBack}
        />
        <div>
          <h1 className={styles.title}>Budget Dashboard</h1>
          <p className={styles.subtitle}>Track your spending and stay on budget</p>
        </div>
      </div>

      {/* Alert for overspending */}
      {overspentCategories > 0 && (
        <div 
          className={styles.alertCard}
          style={{
            background: `linear-gradient(135deg, 
              color-mix(in srgb, var(--colorStatusDangerBackground1) 25%, transparent) 0%, 
              color-mix(in srgb, var(--colorStatusDangerBackground1) 15%, transparent) 50%, 
              color-mix(in srgb, var(--colorStatusDangerBackground1) 10%, transparent) 100%)`,
            border: `1px solid color-mix(in srgb, var(--colorStatusDangerBackground1) 50%, transparent)`,
            boxShadow: `0 4px 12px color-mix(in srgb, var(--colorStatusDangerBackground1) 20%, transparent), inset 0 1px 0 color-mix(in srgb, var(--colorStatusDangerBackground1) 30%, transparent)`,
          }}
        >
          <div 
            className={styles.alertCardGradient}
            style={{ 
              background: `radial-gradient(circle at 20% 80%, 
                color-mix(in srgb, var(--colorStatusDangerBackground1) 30%, transparent) 0%, 
                transparent 60%)`,
            }}
          />
          <div className={styles.alertCardContent}>
            <div className={styles.alertHeader}>
              <AlertRegular style={{ color: 'var(--colorNeutralForegroundOnBrand)' }} />
              <span className={styles.alertTitle}>Budget Alert</span>
            </div>
            <p className={styles.alertMessage}>
              You have {overspentCategories} categor{overspentCategories === 1 ? 'y' : 'ies'} over budget. Consider reviewing your spending patterns.
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <TabList 
        selectedValue={selectedTab} 
        onTabSelect={(e, data) => setSelectedTab(data.value)}
        style={{ marginBottom: '24px' }}
      >
        <Tab value="overview">Overview</Tab>
        <Tab value="categories">Categories</Tab>
        <Tab value="trends">Trends</Tab>
        <Tab value="insights">Insights</Tab>
      </TabList>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            {(() => {
              const statCards = [
                { value: <Money amount={totalSpent} />, label: 'Total Spent', name: 'totalSpent', color: 'var(--colorPalettePurpleBackground2)' },
                { value: <Money amount={totalBudget} />, label: 'Total Budget', name: 'totalBudget', color: 'var(--colorPaletteTealBackground2)' },
                { value: <Money amount={remainingBudget} />, label: 'Remaining', name: 'remaining', color: 'var(--colorPaletteGreenBackground2)' },
                { value: onTrackCategories, label: 'On Track Categories', name: 'onTrackCategories', color: 'var(--colorPaletteCornflowerBackground2)' }
              ];

              return statCards.map((card, index) => {
                const backgroundColor = card.color;
                const subtleGradient = `linear-gradient(135deg, 
                  color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
                  color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
                  color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

                return (
                  <div 
                    key={index}
                    className={styles.statCard}
                    style={{ 
                      background: subtleGradient,
                      border: `1px solid color-mix(in srgb, ${backgroundColor} 50%, transparent)`,
                      boxShadow: `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 30%, transparent)`,
                    }}
                  >
                    <div 
                      className={styles.statCardGradient}
                      style={{ 
                        background: `radial-gradient(circle at 20% 80%, 
                          color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                          transparent 60%)`,
                      }}
                    />
                    <div className={styles.statCardContent}>
                      <div className={styles.statValue}>{card.value}</div>
                      <div className={styles.statLabel}>{card.label}</div>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Quick Actions */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--colorNeutralForeground1)' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button appearance="primary" icon={<AddRegular />}>
                Add Budget Category
              </Button>
              <Button appearance="outline" icon={<DataPieRegular />}>
                View Reports
              </Button>
              <Button appearance="outline" icon={<CalendarRegular />}>
                Set Reminders
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Categories Tab */}
      {selectedTab === 'categories' && (
        <>
          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.searchInput}>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--colorNeutralStroke2)',
                  backgroundColor: 'var(--colorNeutralBackground1)',
                  color: 'var(--colorNeutralForeground1)',
                }}
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--colorNeutralStroke2)',
                backgroundColor: 'var(--colorNeutralBackground1)',
                color: 'var(--colorNeutralForeground1)',
              }}
            >
              <option value="all">All Status</option>
              <option value="normal">On Track</option>
              <option value="warning">Warning</option>
              <option value="danger">Over Budget</option>
            </select>
          </div>

          {/* Category Cards */}
          {filteredCategories.length > 0 ? (
            <div className={styles.categoryGrid}>
              {filteredCategories.map((categoryData) => {
                const category = categoryData.category;
                const percentage = Math.abs(categoryData.budgetPercentage);

                
                return (
                  <div 
                    key={category.id} 
                    className={styles.categoryCard}
                    style={{
                      background: (() => {
                        // Dynamic color based on spending percentage
                        let backgroundColor;
                        if (percentage >= 100) {
                          backgroundColor = 'var(--colorStatusDangerBackground1)'; // Red for over budget
                        } else if (percentage >= 80) {
                          backgroundColor = 'var(--colorStatusWarningBackground1)'; // Orange for warning
                        } else if (percentage >= 60) {
                          backgroundColor = 'var(--colorPaletteYellowBackground2)'; // Yellow for moderate
                        } else if (percentage >= 40) {
                          backgroundColor = 'var(--colorPaletteTealBackground2)'; // Teal for good
                        } else {
                          backgroundColor = 'var(--colorStatusSuccessBackground1)'; // Green for excellent
                        }
                        return `linear-gradient(135deg, 
                          color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
                          color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
                          color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;
                      })(),
                      border: `1px solid color-mix(in srgb, ${(() => {
                        let backgroundColor;
                        if (percentage >= 100) {
                          backgroundColor = 'var(--colorStatusDangerBackground1)';
                        } else if (percentage >= 80) {
                          backgroundColor = 'var(--colorStatusWarningBackground1)';
                        } else if (percentage >= 60) {
                          backgroundColor = 'var(--colorPaletteYellowBackground2)';
                        } else if (percentage >= 40) {
                          backgroundColor = 'var(--colorPaletteTealBackground2)';
                        } else {
                          backgroundColor = 'var(--colorStatusSuccessBackground1)';
                        }
                        return backgroundColor;
                      })()} 50%, transparent)`,
                      boxShadow: `0 4px 12px color-mix(in srgb, ${(() => {
                        let backgroundColor;
                        if (percentage >= 100) {
                          backgroundColor = 'var(--colorStatusDangerBackground1)';
                        } else if (percentage >= 80) {
                          backgroundColor = 'var(--colorStatusWarningBackground1)';
                        } else if (percentage >= 60) {
                          backgroundColor = 'var(--colorPaletteYellowBackground2)';
                        } else if (percentage >= 40) {
                          backgroundColor = 'var(--colorPaletteTealBackground2)';
                        } else {
                          backgroundColor = 'var(--colorStatusSuccessBackground1)';
                        }
                        return backgroundColor;
                      })()} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${(() => {
                        let backgroundColor;
                        if (percentage >= 100) {
                          backgroundColor = 'var(--colorStatusDangerBackground1)';
                        } else if (percentage >= 80) {
                          backgroundColor = 'var(--colorStatusWarningBackground1)';
                        } else if (percentage >= 60) {
                          backgroundColor = 'var(--colorPaletteYellowBackground2)';
                        } else if (percentage >= 40) {
                          backgroundColor = 'var(--colorPaletteTealBackground2)';
                        } else {
                          backgroundColor = 'var(--colorStatusSuccessBackground1)';
                        }
                        return backgroundColor;
                      })()} 30%, transparent)`,
                    }}
                  >
                    <div 
                      className={styles.categoryCardGradient}
                      style={{ 
                        background: `radial-gradient(circle at 20% 80%, 
                          color-mix(in srgb, ${(() => {
                            let backgroundColor;
                            if (percentage >= 100) {
                              backgroundColor = 'var(--colorStatusDangerBackground1)';
                            } else if (percentage >= 80) {
                              backgroundColor = 'var(--colorStatusWarningBackground1)';
                            } else if (percentage >= 60) {
                              backgroundColor = 'var(--colorPaletteYellowBackground2)';
                            } else if (percentage >= 40) {
                              backgroundColor = 'var(--colorPaletteTealBackground2)';
                            } else {
                              backgroundColor = 'var(--colorStatusSuccessBackground1)';
                            }
                            return backgroundColor;
                          })()} 30%, transparent) 0%, 
                          transparent 60%)`,
                      }}
                    />
                    <div className={styles.categoryCardContent}>
                      <div className={styles.categoryHeader}>
                        <CustomAvatar 
                          size={40} 
                          char={category.name.charAt(0)} 
                          shape="circle"
                          color={pickRandomByHash(category.name, fluentColors)}
                        />
                        <div>
                          <div className={styles.categoryName}>{category.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8 }}>
                            {percentage.toFixed(1)}% of budget
                          </div>
                        </div>
                      </div>

                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: getStatusColor(percentage),
                          }}
                        />
                      </div>

                      <div className={styles.categoryStats}>
                        <div>
                          <span className={styles.amount}>
                            <Money amount={Math.abs(categoryData.total)} />
                          </span>
                          <span style={{ color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8 }}> / </span>
                          <span style={{ color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8 }}>
                            <Money amount={categoryData.yearlyLimit} />
                          </span>
                        </div>
                        <div className={styles.percentage}>
                          {percentage.toFixed(1)}%
                        </div>
                      </div>

                      <div className={styles.actions}>
                        <Button 
                          appearance="outline" 
                          size="small" 
                          className={styles.actionButton}
                          onClick={() => handleViewDetails(categoryData)}
                        >
                          View Details
                        </Button>
                        <Button appearance="outline" size="small" className={styles.actionButton}>
                          Edit Budget
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <DataPieRegular style={{ fontSize: '48px', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--colorNeutralForeground1)' }}>
                No categories found
              </h3>
              <p>No budget categories match your current filters.</p>
            </div>
          )}
        </>
      )}

      {/* Trends Tab */}
      {selectedTab === 'trends' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', justifyContent: 'center', padding: 24 }}>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 600 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--colorNeutralForeground1)' }}>Monthly Spending Trend</h3>
            {/* Simple SVG line chart for monthlyTotals */}
            <svg width="100%" height="180" viewBox="0 0 480 180" style={{ background: 'var(--colorNeutralBackground2)', borderRadius: 12, border: '1px solid var(--colorNeutralStroke2)' }}>
              {/* X axis */}
              <line x1="40" y1="160" x2="460" y2="160" stroke="var(--colorNeutralStroke3)" strokeWidth="2" />
              {/* Y axis */}
              <line x1="40" y1="20" x2="40" y2="160" stroke="var(--colorNeutralStroke3)" strokeWidth="2" />
              {/* Data line */}
              {(() => {
                const max = Math.max(...monthlyTotals, 1);
                const points = monthlyTotals.map((val, i) => {
                  const x = 40 + (i * (420 / 11));
                  const y = 160 - ((val / max) * 120);
                  return `${x},${y}`;
                }).join(' ');
                return <polyline points={points} fill="none" stroke="var(--colorStatusSuccessBorder1)" strokeWidth="3" />;
              })()}
              {/* Dots */}
              {monthlyTotals.map((val, i) => {
                const max = Math.max(...monthlyTotals, 1);
                const x = 40 + (i * (420 / 11));
                const y = 160 - ((val / max) * 120);
                return <circle key={i} cx={x} cy={y} r={4} fill="var(--colorStatusSuccessBackground1)" />;
              })}
              {/* Month labels */}
              {Array.from({ length: 12 }).map((_, i) => {
                const x = 40 + (i * (420 / 11));
                return <text key={i} x={x} y={175} fontSize={12} textAnchor="middle" fill="var(--colorNeutralForeground3)">{getMonthName(i)}</text>;
              })}
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 320, maxWidth: 400 }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--colorNeutralForeground1)' }}>Spending by Category</h3>
            {/* Custom SVG donut chart */}
            <svg width={200} height={200} viewBox="0 0 200 200">
              {donutSegments.map((seg, i) => (
                <path key={i} d={seg.path} fill={seg.color} stroke="#222" strokeWidth={0.5} />
              ))}
              {/* Inner circle for donut effect */}
              <circle cx={100} cy={100} r={50} fill="var(--colorNeutralBackground1)" />
              {/* Center label */}
              <text x={100} y={110} textAnchor="middle" fontSize={18} fill="var(--colorNeutralForeground1)">
                {donutTotal > 0 ? 'Total' : ''}
              </text>
              <text x={100} y={130} textAnchor="middle" fontSize={16} fill="var(--colorNeutralForeground3)">
                {donutTotal > 0 ? donutTotal.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : ''}
              </text>
            </svg>
            {/* Legend */}
            <div style={{ marginTop: 16 }}>
              {donutChartData.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ display: 'inline-block', width: 16, height: 16, background: d.color, borderRadius: 4 }}></span>
                  <span style={{ color: 'var(--colorNeutralForeground1)' }}>{d.label}</span>
                  <span style={{ color: 'var(--colorNeutralForeground3)', marginLeft: 'auto' }}>{d.value.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div style={{ padding: 32, maxWidth: 900, margin: '0 auto' }}>
          <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, color: 'var(--colorNeutralForeground1)' }}>Key Insights</h3>
          
          {/* Main Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
            {(() => {
              const insightCards = [
                {
                  title: 'Category Analysis',
                  items: [
                    { label: 'Fastest Growing', value: fastestGrowing.name ? `${fastestGrowing.name} (${fastestGrowing.growth.toFixed(1)}% growth)` : 'N/A' },
                    { label: 'Most Over Budget', value: mostOverBudget ? `${mostOverBudget.category.name} (${mostOverBudget.budgetPercentage.toFixed(1)}% used)` : 'N/A' },
                    { label: 'Highest Spending Month', value: `${highestMonthName} (${monthlyTotals[highestMonthIdx] ? <Money amount={monthlyTotals[highestMonthIdx]} /> : 'N/A'})` },
                    { label: 'Most Efficient', value: mostEfficientCategory.name ? `${mostEfficientCategory.name} (${mostEfficientCategory.efficiency.toFixed(1)}% used)` : 'N/A' }
                  ],
                  name: 'categoryAnalysis'
                },
                {
                  title: 'Transaction Analysis',
                  items: [
                    { label: 'Total Transactions', value: subCategoryAnalysis.length },
                    { label: 'Average Transaction', value: <Money amount={averageTransactionAmount} /> },
                    { label: 'Highest Transaction', value: highestTransaction.transactionTitle ? `${highestTransaction.transactionTitle} (${highestTransaction.categoryName} > ${highestTransaction.subCategoryName})` : 'N/A' },
                    { label: 'Sub-categories', value: Object.keys(subCategoryTotals).length }
                  ],
                  name: 'transactionAnalysis'
                }
              ];

              return insightCards.map((card, index) => {
                const backgroundColor = pickRandomByHash(card.name, fluentColors);
                const subtleGradient = `linear-gradient(135deg, 
                  color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
                  color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
                  color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

                return (
                  <div 
                    key={index}
                    className={styles.insightCard}
                    style={{ 
                      background: subtleGradient,
                      border: `1px solid color-mix(in srgb, ${backgroundColor} 50%, transparent)`,
                      boxShadow: `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 30%, transparent)`,
                    }}
                  >
                    <div 
                      className={styles.insightCardGradient}
                      style={{ 
                        background: `radial-gradient(circle at 20% 80%, 
                          color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                          transparent 60%)`,
                      }}
                    />
                    <div className={styles.insightCardContent}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--colorNeutralForegroundOnBrand)' }}>{card.title}</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--colorNeutralForegroundOnBrand)', fontSize: 14 }}>
                        {card.items.map((item, itemIndex) => (
                          <li key={itemIndex} style={{ marginBottom: 8 }}>
                            <b>{item.label}:</b> {item.value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Top Sub-Categories */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--colorNeutralForeground1)' }}>Top Sub-Categories by Spending</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {topSubCategories.map((subCat, index) => {
                const backgroundColor = pickRandomByHash(subCat.subCategoryName, fluentColors);
                const subtleGradient = `linear-gradient(135deg, 
                  color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
                  color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
                  color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

                return (
                  <div 
                    key={index} 
                    className={styles.topSubCategoryCard}
                    style={{ 
                      background: subtleGradient,
                      border: `1px solid color-mix(in srgb, ${backgroundColor} 50%, transparent)`,
                      boxShadow: `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 30%, transparent)`,
                    }}
                  >
                    <div 
                      className={styles.topSubCategoryCardGradient}
                      style={{ 
                        background: `radial-gradient(circle at 20% 80%, 
                          color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                          transparent 60%)`,
                      }}
                    />
                    <div className={styles.topSubCategoryCardContent}>
                      <div className={styles.rankBadge} style={{
                        backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'var(--colorNeutralStroke3)',
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--colorNeutralForegroundOnBrand)' }}>
                          {subCat.subCategoryName}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8 }}>
                          {subCat.categoryName}
                        </div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--colorNeutralForegroundOnBrand)', marginBottom: 4 }}>
                        <Money amount={subCat.total} />
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8 }}>
                        {subCat.transactionCount} transaction{subCat.transactionCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sub-Category Growth */}
          {fastestGrowingSubCategory.subCategoryName && (
            <div style={{ marginBottom: 32 }}>
              <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--colorNeutralForeground1)' }}>Fastest Growing Sub-Category</h4>
              <div 
                className={styles.growthCard}
                style={{
                  background: `linear-gradient(135deg, 
                    color-mix(in srgb, var(--colorStatusSuccessBackground1) 25%, transparent) 0%, 
                    color-mix(in srgb, var(--colorStatusSuccessBackground1) 15%, transparent) 50%, 
                    color-mix(in srgb, var(--colorStatusSuccessBackground1) 10%, transparent) 100%)`,
                  border: `1px solid color-mix(in srgb, var(--colorStatusSuccessBackground1) 50%, transparent)`,
                  boxShadow: `0 4px 12px color-mix(in srgb, var(--colorStatusSuccessBackground1) 20%, transparent), inset 0 1px 0 color-mix(in srgb, var(--colorStatusSuccessBackground1) 30%, transparent)`,
                }}
              >
                <div 
                  className={styles.growthCardGradient}
                  style={{ 
                    background: `radial-gradient(circle at 20% 80%, 
                      color-mix(in srgb, var(--colorStatusSuccessBackground1) 30%, transparent) 0%, 
                      transparent 60%)`,
                  }}
                />
                <div className={styles.growthCardContent}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--colorNeutralForegroundOnBrand)', marginBottom: 8 }}>
                    {fastestGrowingSubCategory.subCategoryName}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8, marginBottom: 12 }}>
                    {fastestGrowingSubCategory.categoryName}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--colorNeutralForegroundOnBrand)' }}>
                    {fastestGrowingSubCategory.growth.toFixed(1)}% growth
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--colorNeutralForeground1)' }}>Recommendations</h4>
            <div 
              className={styles.recommendationCard}
              style={{
                background: `linear-gradient(135deg, 
                  color-mix(in srgb, var(--colorStatusWarningBackground1) 25%, transparent) 0%, 
                  color-mix(in srgb, var(--colorStatusWarningBackground1) 15%, transparent) 50%, 
                  color-mix(in srgb, var(--colorStatusWarningBackground1) 10%, transparent) 100%)`,
                border: `1px solid color-mix(in srgb, var(--colorStatusWarningBackground1) 50%, transparent)`,
                boxShadow: `0 4px 12px color-mix(in srgb, var(--colorStatusWarningBackground1) 20%, transparent), inset 0 1px 0 color-mix(in srgb, var(--colorStatusWarningBackground1) 30%, transparent)`,
              }}
            >
              <div 
                className={styles.recommendationCardGradient}
                style={{ 
                  background: `radial-gradient(circle at 20% 80%, 
                    color-mix(in srgb, var(--colorStatusWarningBackground1) 30%, transparent) 0%, 
                    transparent 60%)`,
                }}
              />
              <div className={styles.recommendationCardContent}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: 'var(--colorNeutralForegroundOnBrand)' }}>
                  {mostOverBudget && mostOverBudget.budgetPercentage > 100 && (
                    <li style={{ marginBottom: 8 }}>⚠️ Consider reducing spending in <b>{mostOverBudget.category.name}</b></li>
                  )}
                  {fastestGrowing.growth > 50 && (
                    <li style={{ marginBottom: 8 }}>📈 Monitor <b>{fastestGrowing.name}</b> - growing rapidly</li>
                  )}
                  {averageTransactionAmount > 100 && (
                    <li style={{ marginBottom: 8 }}>💰 High average transaction amount - review large purchases</li>
                  )}
                  {Object.keys(subCategoryTotals).length > 10 && (
                    <li style={{ marginBottom: 8 }}>📊 Many sub-categories - consider consolidation</li>
                  )}
                  {(!mostOverBudget || mostOverBudget.budgetPercentage <= 100) && (
                    <li style={{ marginBottom: 8 }}>✅ Great job! Your spending is well managed</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Budget Status Summary */}
          <div>
            <h4 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--colorNeutralForeground1)' }}>Budget Status Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {categoryEfficiency.map((cat, index) => {
                const backgroundColor = cat.isOverBudget 
                  ? 'var(--colorStatusDangerBackground1)' 
                  : 'var(--colorStatusSuccessBackground1)';
                const subtleGradient = `linear-gradient(135deg, 
                  color-mix(in srgb, ${backgroundColor} 25%, transparent) 0%, 
                  color-mix(in srgb, ${backgroundColor} 15%, transparent) 50%, 
                  color-mix(in srgb, ${backgroundColor} 10%, transparent) 100%)`;

                return (
                  <div 
                    key={index} 
                    className={styles.budgetStatusCard}
                    style={{ 
                      background: subtleGradient,
                      border: `1px solid color-mix(in srgb, ${backgroundColor} 50%, transparent)`,
                      boxShadow: `0 4px 12px color-mix(in srgb, ${backgroundColor} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${backgroundColor} 30%, transparent)`,
                    }}
                  >
                    <div 
                      className={styles.budgetStatusCardGradient}
                      style={{ 
                        background: `radial-gradient(circle at 20% 80%, 
                          color-mix(in srgb, ${backgroundColor} 30%, transparent) 0%, 
                          transparent 60%)`,
                      }}
                    />
                    <div className={styles.budgetStatusCardContent}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--colorNeutralForegroundOnBrand)', marginBottom: 4 }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--colorNeutralForegroundOnBrand)' }}>
                        {cat.efficiency.toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--colorNeutralForegroundOnBrand)', opacity: 0.8 }}>
                        {cat.isOverBudget ? 'Over Budget' : `Remaining: ${cat.remainingBudget > 0 ? <Money amount={cat.remainingBudget} /> : 'N/A'}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Category Details Modal */}
      {selectedCategory && (
        <Dialog open={detailModalOpen} onOpenChange={(e, data) => setDetailModalOpen(data.open)}>
          <DialogSurface style={{ maxWidth: '800px', width: '90vw' }}>
            <DialogBody>
              <DialogTitle>
                <div className={styles.detailHeader}>
                  <CustomAvatar 
                    size={48} 
                    char={selectedCategory.category.name.charAt(0)} 
                    shape="circle"
                    color={pickRandomByHash(selectedCategory.category.name, fluentColors)}
                  />
                  <div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: 'var(--colorNeutralForeground1)' }}>
                      {selectedCategory.category.name}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--colorNeutralForeground3)' }}>
                      Budget Category Details
                    </p>
                  </div>
                </div>
              </DialogTitle>
              
              <DialogContent>
                {/* Summary Stats */}
                <div className={styles.detailStats}>
                  <div className={styles.detailStat}>
                    <div className={styles.detailStatValue}>
                      <Money amount={Math.abs(selectedCategory.total)} />
                    </div>
                    <div className={styles.detailStatLabel}>Total Spent</div>
                  </div>
                  <div className={styles.detailStat}>
                    <div className={styles.detailStatValue}>
                      <Money amount={selectedCategory.yearlyLimit} />
                    </div>
                    <div className={styles.detailStatLabel}>Yearly Budget</div>
                  </div>
                  <div className={styles.detailStat}>
                    <div className={styles.detailStatValue} style={{ color: getStatusColor(Math.abs(selectedCategory.budgetPercentage)) }}>
                      {Math.abs(selectedCategory.budgetPercentage).toFixed(1)}%
                    </div>
                    <div className={styles.detailStatLabel}>Budget Used</div>
                  </div>
                  <div className={styles.detailStat}>
                    <div className={styles.detailStatValue}>
                      {selectedCategory.transactions.length}
                    </div>
                    <div className={styles.detailStatLabel}>Transactions</div>
                  </div>
                </div>

                {/* Monthly Breakdown */}
                <div className={styles.monthlyBreakdown}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--colorNeutralForeground1)' }}>
                    Monthly Breakdown
                  </h3>
                  <div className={styles.monthGrid}>
                    {Array.from({ length: 12 }).map((_, index) => {
                      const monthAmount = Math.abs(selectedCategory.monthlyTotal[index] || 0);
                      const monthlyLimit = getMonthlyLimit(selectedCategory);
                      const monthPercentage = monthlyLimit > 0 ? (monthAmount / monthlyLimit) * 100 : 0;
                      
                      return (
                        <div key={index} className={styles.monthCard}>
                          <div className={styles.monthName}>{getMonthName(index)}</div>
                          <div className={styles.monthAmount}>
                            <Money amount={monthAmount} />
                          </div>
                          <div className={styles.monthPercentage}>
                            {monthPercentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Transactions */}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--colorNeutralForeground1)' }}>
                    Recent Transactions
                  </h3>
                  <div className={styles.transactionsList}>
                    {selectedCategory.transactions.slice(0, 10).map((transaction, index) => (
                      <div key={index} className={styles.transactionItem}>
                        <div className={styles.transactionInfo}>
                          <ReceiptRegular style={{ fontSize: '16px', color: 'var(--colorNeutralForeground3)' }} />
                          <div>
                            <div className={styles.transactionTitle}>{transaction.title}</div>
                            <div className={styles.transactionDate}>
                              {moment(transaction.transactionAt).format('MMM DD, YYYY')}
                            </div>
                          </div>
                        </div>
                        <div className={styles.transactionAmount}>
                          <Money amount={transaction.amount} />
                        </div>
                      </div>
                    ))}
                    {selectedCategory.transactions.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px', color: 'var(--colorNeutralForeground3)' }}>
                        No transactions found for this category
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>

              <DialogActions>
                <Button appearance="subtle" onClick={() => setDetailModalOpen(false)}>
                  Close
                </Button>
                <Button appearance="primary" icon={<MoneyRegular />}>
                  Edit Budget
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

export default BudgetPage; 