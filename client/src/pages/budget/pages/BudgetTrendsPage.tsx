import { tokens } from '@fluentui/react-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { moneyFormat } from '../../../constants';
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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [previousSelection, setPreviousSelection] = useState<Set<string>>(new Set());
  const chartRef = useRef<HighchartsReact.RefObject>(null);

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



  // Effect to handle smooth chart transitions when selected categories change
  useEffect(() => {
    if (chartRef.current && chartRef.current.chart) {
      const chart = chartRef.current.chart;
      
      // Simple, clean transition
      chart.update({
        chart: {
          animation: {
            duration: 1200,
            easing: 'easeOutQuart',
          }
        }
      }, false);

      // Update series data
      const updatedSeries = sortedBudgetData.map((cat, idx) => {
        const isSelected = selectedCategories.size === 0 || selectedCategories.has(cat.category.name);
        const baseColor = paletteColors[idx % paletteColors.length] || tokens.colorBrandBackground;
        
        return {
          type: 'line' as const,
          name: cat.category.name,
          data: monthTicks.map((monthDate) => 
            Math.abs(cat.monthlyTotal?.[monthDate.getMonth()] || 0)
          ),
          color: isSelected ? baseColor : tokens.colorNeutralStroke2,
          opacity: isSelected ? 1 : 0.15,
          visible: true,
          marker: {
            enabled: isSelected,
            fillColor: baseColor,
            lineColor: baseColor,
            lineWidth: 0,
            radius: isSelected ? 6 : 3,
          },
        };
      });

      // Update all series at once for smooth transition
      updatedSeries.forEach((seriesData, index) => {
        if (chart.series[index]) {
          const series = chart.series[index];
          const categoryName = seriesData.name;
          const wasSelected = previousSelection.size === 0 || previousSelection.has(categoryName);
          const isNowSelected = selectedCategories.size === 0 || selectedCategories.has(categoryName);
          
          // Apply custom animations based on selection state
          if (!wasSelected && isNowSelected) {
            // Category being selected - animate from left to right
            // Update series first without opacity manipulation
            series.update(seriesData, false);
            
            // Then animate the line drawing
            setTimeout(() => {
              if (series.graph) {
                const path = series.graph.element as SVGPathElement;
                if (path && path.getTotalLength) {
                  const pathLength = path.getTotalLength();
                  
                  // Reset any existing animations
                  path.style.transition = '';
                  path.style.strokeDasharray = `${pathLength} ${pathLength}`;
                  path.style.strokeDashoffset = pathLength.toString();
                  
                  setTimeout(() => {
                    path.style.transition = `stroke-dashoffset 1200ms ease-out`;
                    path.style.strokeDashoffset = '0';
                    
                    // Clean up after animation
                    setTimeout(() => {
                      path.style.strokeDasharray = '';
                      path.style.strokeDashoffset = '';
                      path.style.transition = '';
                    }, 1200);
                  }, 50);
                }
              }
            }, 50);
          } else if (wasSelected && !isNowSelected) {
            // Category being deselected - animate to bottom and fade
            if (series.graph) {
              const path = series.graph.element as SVGPathElement;
              if (path) {
                // Clear any existing stroke dash animations
                path.style.strokeDasharray = '';
                path.style.strokeDashoffset = '';
                
                // Apply fade and slide down animation
                path.style.transition = 'transform 600ms ease-in, opacity 600ms ease-in';
                path.style.transform = 'translateY(30px)';
                path.style.opacity = '0';
                
                setTimeout(() => {
                  series.update(seriesData, false);
                  // Reset styles after update
                  setTimeout(() => {
                    if (path) {
                      path.style.transition = '';
                      path.style.transform = '';
                      path.style.opacity = '';
                    }
                  }, 100);
                }, 600);
              }
            } else {
              series.update(seriesData, false);
            }
          } else {
            // Normal update
            series.update(seriesData, false);
          }
        }
      });

      // Update previous selection for next comparison
      setPreviousSelection(new Set(selectedCategories));

      // Update y-axis smoothly
      const maxCategoryValue = Math.max(
        ...filteredBudgetData.map(cat => 
          Math.max(...monthTicks.map((_, monthIndex) => Math.abs(cat.monthlyTotal?.[monthIndex] || 0)))
        )
      );

      const yAxisMax = maxCategoryValue > 0 ? Math.ceil(maxCategoryValue * 1.2 / 1000) * 1000 : 10000;

      chart.yAxis[0].update({
        max: yAxisMax,
        min: 0,
      }, false);

      // Final redraw
      chart.redraw();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, budgetData, transactions]);

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

  // Filter data based on selected categories
  const filteredBudgetData = selectedCategories.size > 0 
    ? sortedBudgetData.filter(cat => selectedCategories.has(cat.category.name))
    : sortedBudgetData;

  // Prepare data for Highcharts line chart
  // Always include all categories in series, show all data but style differently for unselected ones
  const series = sortedBudgetData.map((cat, idx) => {
    const isSelected = selectedCategories.size === 0 || selectedCategories.has(cat.category.name);
    const baseColor = paletteColors[idx % paletteColors.length] || tokens.colorBrandBackground;
    
    return {
      type: 'line' as const,
      name: cat.category.name,
      data: monthTicks.map((monthDate) => 
        Math.abs(cat.monthlyTotal?.[monthDate.getMonth()] || 0)
      ),
      color: isSelected ? baseColor : tokens.colorNeutralStroke2,
      opacity: isSelected ? 1 : 0.3,
      visible: true,
      enableMouseTracking: true,
      marker: {
        enabled: isSelected,
        fillColor: baseColor,
        lineColor: baseColor,
        lineWidth: 0,
        radius: isSelected ? 6 : 3,
      },
    };
  });

  // For line charts, we want to show individual category values, not stacked totals
  const maxCategoryValue = Math.max(
    ...filteredBudgetData.map(cat => 
      Math.max(...monthTicks.map((_, monthIndex) => Math.abs(cat.monthlyTotal?.[monthIndex] || 0)))
    )
  );

  // Use the maximum individual category value for better scaling
  const yAxisMax = maxCategoryValue > 0 ? Math.ceil(maxCategoryValue * 1.2 / 1000) * 1000 : 10000;

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      style: {
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart',
      },
      events: {
        load: function() {
          // Custom left-to-right animation using CSS - only for initial load
          this.series.forEach((series, seriesIndex) => {
            const isSelected = selectedCategories.size === 0 || selectedCategories.has(series.name);
            if (series.graph && isSelected) {
              const path = series.graph.element as SVGPathElement;
              if (path && path.getTotalLength) {
                const pathLength = path.getTotalLength();
                path.style.strokeDasharray = `${pathLength} ${pathLength}`;
                path.style.strokeDashoffset = pathLength.toString();
                path.style.transition = `stroke-dashoffset ${1200 + seriesIndex * 100}ms ease-out`;
                
                setTimeout(() => {
                  path.style.strokeDashoffset = '0';
                  // Clean up after initial animation
                  setTimeout(() => {
                    path.style.strokeDasharray = '';
                    path.style.strokeDashoffset = '';
                    path.style.transition = '';
                  }, 1200 + seriesIndex * 100);
                }, 100 + seriesIndex * 50);
              }
            }
          });
        }
      }
    },
    title: {
      text: selectedCategories.size > 0 
        ? `Budget Trends - ${Array.from(selectedCategories).join(', ')}`
        : 'Budget Trends',
      style: {
        color: tokens.colorNeutralForegroundOnBrand,
        fontSize: '20px',
        fontWeight: '600',
      },
    },
    xAxis: {
      categories: monthTicks.map(date => date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
      labels: {
        style: {
          color: tokens.colorNeutralForegroundOnBrand,
        },
      },
      lineColor: tokens.colorNeutralStroke2,
      tickColor: tokens.colorNeutralStroke2,
      gridLineColor: tokens.colorNeutralStroke2,
    },
    yAxis: {
      title: {
        text: 'Amount',
        style: {
          color: tokens.colorNeutralForegroundOnBrand,
        },
      },
      labels: {
        style: {
          color: tokens.colorNeutralForegroundOnBrand,
        },
        formatter: function() {
          return moneyFormat.format(Number(this.value));
        },
      },
      gridLineColor: tokens.colorNeutralStroke2,
      max: yAxisMax,
      min: 0,
    },
    plotOptions: {
      line: {
        marker: {
          enabled: true,
          radius: 6,
          lineWidth: 0,
          lineColor: undefined,
          fillColor: undefined,
        },
        lineWidth: 3,
        animation: {
          duration: 1200,
          easing: 'easeOutQuart',
        },
      },
      series: {
        animation: {
          duration: 1200,
          easing: 'easeOutQuart',
          defer: 200, // Delay the start of animation
        },
        states: {
          hover: {
            enabled: true,
            lineWidth: 4,
            animation: {
              duration: 200,
              easing: 'easeOutQuad',
            },
          },
          inactive: {
            enabled: false, // Disable inactive state to prevent legend hiding
          },
        },
      },
    },
    tooltip: {
      backgroundColor: tokens.colorNeutralBackground2,
      borderColor: tokens.colorNeutralStroke2,
      borderRadius: 8,
      style: {
        color: tokens.colorNeutralForegroundOnBrand,
      },
      formatter: function() {
        const visiblePoints = this.points?.filter(point => {
          const isSelected = selectedCategories.size === 0 || selectedCategories.has(point.series.name);
          return (point.y || 0) > 0 && isSelected;
        }) || [];
        
        return `
          <b>${this.x}</b><br/>
          ${visiblePoints.map(point => 
            `<span style="color: ${point.color}">●</span> ${point.series.name}: ${moneyFormat.format(point.y || 0)}<br/>`
          ).join('')}
        `;
      },
      shared: true,
      animation: {
        duration: 200,
        easing: 'easeOutQuad',
      },
      followPointer: true,
    },
    legend: {
      enabled: false, // Disable Highcharts legend completely
    },
    credits: {
      enabled: false,
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 768,
          },
          chartOptions: {
            legend: {
              layout: 'horizontal',
              align: 'center',
              verticalAlign: 'bottom',
            },
          },
        },
      ],
    },
  };

  const handleResetView = () => {
    setSelectedCategories(new Set());
  };

  const handleSelectAll = () => {
    const allCategories = new Set(sortedBudgetData.map(cat => cat.category.name));
    setSelectedCategories(allCategories);
  };

  const getSelectedCategoriesText = () => {
    if (selectedCategories.size === 0) return 'All Categories';
    if (selectedCategories.size === 1) return Array.from(selectedCategories)[0];
    if (selectedCategories.size <= 3) return Array.from(selectedCategories).join(', ');
    return `${selectedCategories.size} Categories`;
  };

  return (
    <div style={{ padding: 32, color: tokens.colorNeutralForegroundOnBrand, width: '100%', maxWidth: '100vw', margin: '0 auto' }}>
      <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 18 }}>Budget Trends</h2>
      <div style={{ background: tokens.colorNeutralBackground2, borderRadius: 18, boxShadow: '0 4px 24px #0002', padding: 32 }}>
        {loading ? (
          <div style={{ color: tokens.colorNeutralForeground3 }}>Loading trends...</div>
        ) : (
          <>
            <div style={{
              marginBottom: 16,
              height: selectedCategories.size > 0 ? 'auto' : 0,
              overflow: 'hidden',
              transition: 'all 0.4s ease',
              opacity: selectedCategories.size > 0 ? 1 : 0,
            }}>
              <div style={{ 
                padding: '12px 16px', 
                background: tokens.colorNeutralBackground1, 
                borderRadius: 8, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                border: `1px solid ${tokens.colorNeutralStroke1}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: tokens.colorNeutralForegroundOnBrand, fontSize: 14 }}>
                    Showing: <strong>{getSelectedCategoriesText()}</strong>
                  </span>
                  {selectedCategories.size > 1 && (
                    <span style={{ 
                      color: tokens.colorNeutralForeground3, 
                      fontSize: 12,
                      background: tokens.colorNeutralBackground2,
                      padding: '2px 8px',
                      borderRadius: 4,
                    }}>
                      {selectedCategories.size} selected
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSelectAll}
                    style={{
                      background: tokens.colorNeutralBackground2,
                      color: tokens.colorNeutralForegroundOnBrand,
                      border: `1px solid ${tokens.colorNeutralStroke1}`,
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = tokens.colorNeutralBackground3;
                      e.currentTarget.style.borderColor = tokens.colorNeutralStroke2;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = tokens.colorNeutralBackground2;
                      e.currentTarget.style.borderColor = tokens.colorNeutralStroke1;
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleResetView}
                    style={{
                      background: tokens.colorBrandBackground,
                      color: tokens.colorNeutralForegroundOnBrand,
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 12px',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = tokens.colorBrandBackgroundHover}
                    onMouseOut={(e) => e.currentTarget.style.background = tokens.colorBrandBackground}
                  >
                    Show All
                  </button>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', minHeight: 420, position: 'relative' }}>
              <HighchartsReact
                ref={chartRef}
                highcharts={Highcharts}
                options={{
                  ...chartOptions,
                  series,
                }}
              />
            </div>
            
            {/* Custom Legend */}
            <div style={{ 
              marginTop: 20, 
              padding: '8px 0', 
            }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px 16px',
                alignItems: 'center',
              }}>
                {sortedBudgetData.map((cat, idx) => {
                  const isSelected = selectedCategories.size === 0 || selectedCategories.has(cat.category.name);
                  const baseColor = paletteColors[idx % paletteColors.length] || tokens.colorBrandBackground;
                  
                  return (
                    <div
                      key={cat.category.name}
                      onClick={() => {
                        setSelectedCategories(prev => {
                          const newSelection = new Set(prev);
                          if (newSelection.has(cat.category.name)) {
                            newSelection.delete(cat.category.name);
                          } else {
                            newSelection.add(cat.category.name);
                          }
                          return newSelection;
                        });
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        padding: '4px 6px',
                        borderRadius: 6,
                        transition: 'all 0.2s ease',
                        opacity: isSelected ? 1 : 0.5,
                        lineHeight: 1.2,
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.opacity = isSelected ? '1' : '0.5';
                      }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: baseColor,
                          border: `2px solid ${baseColor}`,
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        }}
                      />
                      <span
                        style={{
                          color: tokens.colorNeutralForegroundOnBrand,
                          fontSize: 14,
                          fontWeight: 400,
                          transition: 'text-decoration 0.2s ease',
                          textDecoration: isSelected ? 'underline' : 'none',
                          textUnderlineOffset: '3px',
                        }}
                      >
                        {cat.category.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ marginTop: 16, color: tokens.colorNeutralForeground3, fontSize: 15 }}>
              <b>Tip:</b> Each line represents a spending category over time. Click on category names below the chart to focus on specific ones. Click multiple categories to compare their trends.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BudgetTrendsPage; 