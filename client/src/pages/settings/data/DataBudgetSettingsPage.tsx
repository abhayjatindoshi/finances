import { Button, Input, Table, TableBody, TableCell, TableCellLayout, TableHeader, TableHeaderCell, TableRow, tokens } from '@fluentui/react-components';
import { ChevronLeftRegular, SaveRegular } from '@fluentui/react-icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import CustomButton from '../../../common/CustomButton';
import Money from '../../../common/Money';
import database from '../../../db/database';
import Category from '../../../db/models/Category';
import TableName from '../../../db/TableName';

interface DataBudgetSettingsPageProps {
  categories: Array<Category>;
}

interface CategoryLimits {
  monthlyLimit: number;
  yearlyLimit: number;
}

interface ChangedLimits {
  [categoryId: string]: CategoryLimits;
}

const DataBudgetSettingsPage: React.FC<DataBudgetSettingsPageProps> = ({ categories }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [changedLimits, setChangedLimits] = useState<ChangedLimits>({});
  const [saving, setSaving] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleBack = () => {
    navigate(`/tenants/${tenantId}/settings`);
  };

  const updateLimit = (categoryId: string, field: 'monthlyLimit' | 'yearlyLimit', value: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const currentValue = field === 'monthlyLimit' ? category.monthlyLimit : category.yearlyLimit;
    
    // If the value is the same as the original, remove it from changed limits
    if (value === (currentValue || 0)) {
      const newChangedLimits = { ...changedLimits };
      if (newChangedLimits[categoryId]) {
        delete newChangedLimits[categoryId][field];
        // If no fields are changed for this category, remove the category entirely
        if (Object.keys(newChangedLimits[categoryId]).length === 0) {
          delete newChangedLimits[categoryId];
        }
      }
      setChangedLimits(newChangedLimits);
    } else {
      // Add to changed limits
      setChangedLimits({
        ...changedLimits,
        [categoryId]: {
          ...changedLimits[categoryId],
          [field]: value
        }
      });
    }
  };

  const getCurrentValue = (category: Category, field: 'monthlyLimit' | 'yearlyLimit'): number => {
    const changed = changedLimits[category.id];
    if (changed && field in changed) {
      return changed[field];
    }
    return field === 'monthlyLimit' ? (category.monthlyLimit || 0) : (category.yearlyLimit || 0);
  };

  const hasChanges = Object.keys(changedLimits).length > 0;

  const handleSaveAll = async () => {
    if (!tenantId || !hasChanges) return;

    setSaving(true);
    try {
      await database(tenantId).write(async () => {
        for (const [categoryId, limits] of Object.entries(changedLimits)) {
          const category = categories.find(c => c.id === categoryId);
          if (category) {
            await category.update(c => {
              if ('monthlyLimit' in limits) {
                c.monthlyLimit = limits.monthlyLimit;
              }
              if ('yearlyLimit' in limits) {
                c.yearlyLimit = limits.yearlyLimit;
              }
            });
          }
        }
      });
      setChangedLimits({});
    } catch (error) {
      console.error('Error saving budget limits:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setChangedLimits({});
  };

  // Calculate totals including changes
  const totalMonthly = categories.reduce((sum, category) => {
    return sum + getCurrentValue(category, 'monthlyLimit');
  }, 0);

  const totalYearly = categories.reduce((sum, category) => {
    return sum + getCurrentValue(category, 'yearlyLimit');
  }, 0);

  const totalCombined = totalMonthly * 12 + totalYearly;

  // Group categories by type
  const groupedCategories = categories.reduce((groups, category) => {
    const type = category.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(category);
    return groups;
  }, {} as Record<string, Category[]>);

  // Define the order and colors for category types
  const categoryTypeConfig = {
    'Needs': { color: tokens.colorPaletteRedBackground2, order: 1 },
    'Wants': { color: tokens.colorPaletteYellowBackground2, order: 2 },
    'Savings': { color: tokens.colorPaletteGreenBackground2, order: 3 },
    'Income': { color: tokens.colorPaletteBlueBackground2, order: 4 }
  };

  // Sort the groups by the defined order
  const sortedGroupKeys = Object.keys(groupedCategories).sort((a, b) => {
    const orderA = categoryTypeConfig[a as keyof typeof categoryTypeConfig]?.order || 999;
    const orderB = categoryTypeConfig[b as keyof typeof categoryTypeConfig]?.order || 999;
    return orderA - orderB;
  });

  return (
    <div className="p-6 app-content-height">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button 
              appearance="subtle" 
              icon={<ChevronLeftRegular />}
              onClick={handleBack}
            />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Budget Settings</h1>
              <p className="text-gray-400">Set up and manage budget categories and spending limits</p>
            </div>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <CustomButton 
                variant="subtle" 
                onClick={handleDiscardChanges}
                disabled={saving}
              >
                Discard Changes
              </CustomButton>
              <CustomButton 
                variant="primary" 
                icon={<SaveRegular />} 
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </CustomButton>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-4xl">
          <Table arial-label="Budget limits table" style={{ 
            borderRadius: '8px',
            overflow: 'hidden',
            border: `1px solid ${tokens.colorNeutralStroke2}`
          } as React.CSSProperties}>
            <TableHeader>
              <TableRow style={{ backgroundColor: tokens.colorNeutralBackground4 }}>
                <TableHeaderCell style={{ width: '60px', padding: '8px 4px' }}>
                  <span className="text-white font-semibold">Type</span>
                </TableHeaderCell>
                <TableHeaderCell style={{ width: '35%', minWidth: '180px', padding: '8px 12px' }}>
                  <span className="text-white font-semibold">Category</span>
                </TableHeaderCell>
                <TableHeaderCell style={{ width: '20%', textAlign: 'center', padding: '8px 12px' }}>
                  <span className="text-white font-semibold">Monthly</span>
                </TableHeaderCell>
                <TableHeaderCell style={{ width: '20%', textAlign: 'center', padding: '8px 12px' }}>
                  <span className="text-white font-semibold">Yearly</span>
                </TableHeaderCell>
                <TableHeaderCell style={{ width: '20%', textAlign: 'center', padding: '8px 12px' }}>
                  <span className="text-white font-semibold">Annual Total</span>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGroupKeys.map(categoryType => {
                const typeCategories = groupedCategories[categoryType];
                const typeConfig = categoryTypeConfig[categoryType as keyof typeof categoryTypeConfig];
                
                return (
                  <React.Fragment key={categoryType}>
                    {/* Category Items */}
                    {typeCategories.map((category, index) => {
                      const hasMonthlyChange = changedLimits[category.id]?.monthlyLimit !== undefined;
                      const hasYearlyChange = changedLimits[category.id]?.yearlyLimit !== undefined;
                      const monthlyValue = getCurrentValue(category, 'monthlyLimit');
                      const yearlyValue = getCurrentValue(category, 'yearlyLimit');
                      const annualTotal = (monthlyValue * 12) + yearlyValue;
                      const isFirstInGroup = index === 0;
                      const isLastInGroup = index === typeCategories.length - 1;
                      
                      return (
                        <TableRow 
                          key={category.id}
                          style={{ 
                            backgroundColor: 'transparent',
                            borderBottom: isLastInGroup 
                              ? `2px solid ${typeConfig?.color || tokens.colorNeutralStroke1}`
                              : `1px solid ${tokens.colorNeutralStroke2}`
                          }}
                        >
                          {/* Rotated Category Type Label with Subtotals */}
                          {isFirstInGroup && (
                            <TableCell 
                              style={(() => {
                                const textWidth = categoryType.length * 15 * 0.6; // Approximate text width in pixels
                                const availableHeight = typeCategories.length * 32; // Rough cell height
                                const isHorizontal = textWidth <= availableHeight;
                                
                                return {
                                  padding: '2px 4px',
                                  backgroundColor: `color-mix(in srgb, ${typeConfig?.color || tokens.colorNeutralBackground3} 20%, transparent)`,
                                  borderRight: `3px solid ${typeConfig?.color || tokens.colorNeutralStroke1}`,
                                  verticalAlign: 'middle',
                                  textAlign: 'center',
                                  width: isHorizontal ? '80px' : '60px'
                                };
                              })()}
                              rowSpan={typeCategories.length}
                            >
                              <TableCellLayout>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  height: '100%',
                                  padding: '2px 0'
                                }}>
                                  {/* Category Type Name - dynamically rotated based on available space */}
                                  <div style={(() => {
                                    const textWidth = categoryType.length * 15 * 0.6; // Approximate text width in pixels
                                    const availableHeight = typeCategories.length * 32; // Rough cell height
                                    const isHorizontal = textWidth <= availableHeight;
                                    
                                    return {
                                      transform: isHorizontal ? 'rotate(-90deg)' : 'none',
                                      whiteSpace: 'nowrap',
                                      fontSize: '15px',
                                      fontWeight: 'bold',
                                      color: 'white',
                                      letterSpacing: '1.5px',
                                      textTransform: 'uppercase',
                                      transformOrigin: 'center center',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      maxWidth: isHorizontal ? '76px' : '56px' // Adjust max width based on orientation
                                    };
                                  })()}>
                                    {categoryType}
                                  </div>
                                </div>
                              </TableCellLayout>
                            </TableCell>
                          )}
                          
                          <TableCell style={{ padding: '2px 12px', height: '32px' }}>
                            <TableCellLayout>
                              <span className="text-white font-medium">{category.name}</span>
                            </TableCellLayout>
                          </TableCell>
                          <TableCell style={{ padding: '2px 12px', textAlign: 'center', height: '32px' }}>
                            <TableCellLayout>
                              <Input
                                type="number"
                                value={getCurrentValue(category, 'monthlyLimit') === 0 ? '' : getCurrentValue(category, 'monthlyLimit').toString()}
                                placeholder="0"
                                onChange={(e, data) => updateLimit(category.id, 'monthlyLimit', parseFloat(data.value) || 0)}
                                onFocus={() => setFocusedInput(`${category.id}-monthly`)}
                                onBlur={() => setFocusedInput(null)}
                                contentBefore={t('app.currency')}
                                style={{ 
                                  width: '100px',
                                  height: '28px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  opacity: (getCurrentValue(category, 'monthlyLimit') === 0 && !hasMonthlyChange && focusedInput !== `${category.id}-monthly`) ? 0.4 : 1
                                }}
                                appearance="outline"
                              />
                            </TableCellLayout>
                          </TableCell>
                          <TableCell style={{ padding: '2px 12px', textAlign: 'center', height: '32px' }}>
                            <TableCellLayout>
                              <Input
                                type="number"
                                value={getCurrentValue(category, 'yearlyLimit') === 0 ? '' : getCurrentValue(category, 'yearlyLimit').toString()}
                                placeholder="0"
                                onChange={(e, data) => updateLimit(category.id, 'yearlyLimit', parseFloat(data.value) || 0)}
                                onFocus={() => setFocusedInput(`${category.id}-yearly`)}
                                onBlur={() => setFocusedInput(null)}
                                contentBefore={t('app.currency')}
                                style={{ 
                                  width: '100px',
                                  height: '28px',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  opacity: (getCurrentValue(category, 'yearlyLimit') === 0 && !hasYearlyChange && focusedInput !== `${category.id}-yearly`) ? 0.4 : 1
                                }}
                                appearance="outline"
                              />
                            </TableCellLayout>
                          </TableCell>
                          <TableCell style={{ padding: '2px 12px', textAlign: 'center', height: '32px' }}>
                            <TableCellLayout>
                              <span className="text-gray-300 font-medium">
                                <Money amount={annualTotal} />
                              </span>
                            </TableCellLayout>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })}
              
              {/* Grand Total Row */}
              <TableRow style={{ 
                borderTop: `3px solid ${tokens.colorNeutralStroke1}`,
                backgroundColor: tokens.colorNeutralBackground4
              }}>
                <TableCell style={{ padding: '12px 4px' }}>
                  <TableCellLayout>
                    {/* Empty cell for type column */}
                  </TableCellLayout>
                </TableCell>
                <TableCell style={{ padding: '12px' }}>
                  <TableCellLayout>
                    <span className="text-white font-bold text-lg">Grand Total</span>
                  </TableCellLayout>
                </TableCell>
                <TableCell style={{ padding: '12px', textAlign: 'center' }}>
                  <TableCellLayout>
                    <span className="text-white font-bold text-lg">
                      <Money amount={totalMonthly} />
                    </span>
                  </TableCellLayout>
                </TableCell>
                <TableCell style={{ padding: '12px', textAlign: 'center' }}>
                  <TableCellLayout>
                    <span className="text-white font-bold text-lg">
                      <Money amount={totalYearly} />
                    </span>
                  </TableCellLayout>
                </TableCell>
                <TableCell style={{ padding: '12px', textAlign: 'center' }}>
                  <TableCellLayout>
                    <span className="text-white font-bold text-lg">
                      <Money amount={totalCombined} />
                    </span>
                  </TableCellLayout>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
      
      {hasChanges && (
        <div className="mt-4 p-4 bg-gray-900/30 border border-gray-600/50 rounded-lg">
          <p className="text-gray-300 text-sm">
            You have unsaved changes. Click "Save Changes" to apply them or "Discard Changes" to revert.
          </p>
        </div>
      )}
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(Q.sortBy('name')),
}));

const EnhancedDataBudgetSettingsPage = () => {
  const { tenantId } = useParams();
  const EnhancedDataBudgetSettingsPage = enhance(DataBudgetSettingsPage);
  return <EnhancedDataBudgetSettingsPage tenantId={tenantId} />;
};

export default EnhancedDataBudgetSettingsPage;
