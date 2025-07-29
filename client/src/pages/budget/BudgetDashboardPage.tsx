import { tokens } from '@fluentui/react-components';
import React, { useState } from 'react';
import BudgetCategoriesPage from './pages/BudgetCategoriesPage';
import BudgetSummaryPage from './pages/BudgetSummaryPage';
import BudgetTrendsPage from './pages/BudgetTrendsPage';

const tabOptions = [
  { value: 'summary', label: 'Summary' },
  { value: 'trends', label: 'Trends' },
  { value: 'categories', label: 'Categories' },
];

const pillTabClass = 'dashboard-tab-pill';

const BudgetDashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState('summary');

  return (
    <>
      {/* Soft glow pill style for active tab */}
      <style>{`
        .${pillTabClass} {
          transition: background 0.18s, color 0.18s, transform 0.18s, box-shadow 0.18s;
          background: transparent;
          border: none;
        }
        .${pillTabClass}.active {
          background: rgba(59,130,246,0.17) !important;
          box-shadow: 0 0 10px 2px #3b82f680, 0 0 2px 1px #60a5fa55;
        }
        .${pillTabClass}:hover {
          background: rgba(59,130,246,0.10) !important;
          transform: scale(1.05);
        }
      `}</style>
      <div
        style={{
          // width: '100vw',
          // minHeight: '100vh',
          maxWidth: '100%',
          padding: 0,
          color: tokens.colorNeutralForegroundOnBrand,
          boxSizing: 'border-box',
          background: 'inherit',
        }}
      >
        {/* Custom tab bar with soft glow pill indicator */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 0,
            margin: 0,
            background: 'inherit',
            gap: 0,
          }}
        >
          {tabOptions.map(tab => {
            const isActive = selectedTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedTab(tab.value)}
                className={`${pillTabClass}${isActive ? ' active' : ''} flex items-center gap-3 px-3 py-1 rounded-full transition-all duration-200`}
                style={{
                  margin: '8px 8px',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: '6px 18px',
                  borderRadius: '999px',
                  background: 'transparent',
                  color: tokens.colorNeutralForegroundOnBrand,
                  outline: 'none',
                  cursor: 'pointer',
                  minHeight: 0,
                  position: 'relative',
                  boxSizing: 'border-box',
                }}
              >
                <span className="text-sm font-medium" style={{ position: 'relative', zIndex: 2 }}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div style={{ padding: 0, margin: 0 }}>
          <div style={{ width: '100%', marginTop: 24 }}>
            {selectedTab === 'summary' && <BudgetSummaryPage />}
            {selectedTab === 'trends' && <BudgetTrendsPage />}
            {selectedTab === 'categories' && <BudgetCategoriesPage />}
          </div>
        </div>
      </div>
    </>
  );
};

export default BudgetDashboardPage; 