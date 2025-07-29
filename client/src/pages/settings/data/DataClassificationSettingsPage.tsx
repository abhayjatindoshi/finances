import { Button, DialogTitle, DialogTrigger, Input, Select, Tooltip, tokens } from '@fluentui/react-components';
import { AddRegular, ArrowMoveRegular, ArrowSwapRegular, ChevronLeftRegular, DeleteRegular, EditRegular } from '@fluentui/react-icons';
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomAvatar from '../../../common/CustomAvatar';
import CustomButton from '../../../common/CustomButton';
import { Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, withDialogTheme } from '../../../common/Dialog';
import { fluentColors } from '../../../constants';
import database from '../../../db/database';
import Category, { CategoryType } from '../../../db/models/Category';
import SubCategory from '../../../db/models/SubCategory';
import Transaction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import { pickRandomByHash } from '../../../utils/Common';

// Custom Empty State Icon
const EmptyStateIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Empty container/box with dashed outline */}
    <rect
      x="8"
      y="12"
      width="32"
      height="24"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="4 4"
      fill="none"
    />
    {/* Three dots indicating emptiness */}
    <circle cx="20" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
    <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
    <circle cx="28" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
  </svg>
);

interface DataClassificationSettingsPageProps {
  categories: Array<Category>;
  subCategories: Array<SubCategory>;
  transactions: Array<Transaction>;
}

interface DialogState {
  isOpen: boolean;
  type: 'add-category' | 'edit-category' | 'add-subcategory' | 'edit-subcategory' | 'move-subcategory' | 'move-category' | 'delete-category' | 'delete-subcategory' | null;
  item?: Category | SubCategory;
  parentType?: CategoryType;
  parentCategory?: Category;
}

const DataClassificationSettingsPage: React.FC<DataClassificationSettingsPageProps> = ({ 
  categories, 
  subCategories, 
  transactions 
}) => {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [dialogState, setDialogState] = useState<DialogState>({ isOpen: false, type: null });
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CategoryType>(CategoryType.Needs);
  const [formParentCategory, setFormParentCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const handleBack = () => {
    navigate(`/tenants/${tenantId}/settings`);
  };

  const openDialog = (
    type: DialogState['type'], 
    item?: Category | SubCategory, 
    parentType?: CategoryType, 
    parentCategory?: Category
  ) => {
    setDialogState({ isOpen: true, type, item, parentType, parentCategory });
    
    if (type === 'edit-category' && item) {
      setFormName(item.name);
      setFormType((item as Category).type);
    } else if (type === 'move-category' && item) {
      setFormName(item.name);
      setFormType((item as Category).type);
    } else if (type === 'edit-subcategory' && item) {
      setFormName(item.name);
    } else if (type === 'add-category' && parentType) {
      setFormName('');
      setFormType(parentType);
    } else if (type === 'add-subcategory' && parentCategory) {
      setFormName('');
      setFormParentCategory(parentCategory.id);
    } else if (type === 'move-subcategory' && item) {
      setFormName(item.name);
      setFormParentCategory('');
    } else {
      setFormName('');
      setFormType(CategoryType.Needs);
      setFormParentCategory('');
    }
  };

  const closeDialog = () => {
    setDialogState({ isOpen: false, type: null });
    // Clear form state after a brief delay to prevent UI glitches
    setTimeout(() => {
      setFormName('');
      setFormType(CategoryType.Needs);
      setFormParentCategory('');
    }, 150);
  };

  const handleDialogOpenChange = (_: unknown, data: { open: boolean }) => {
    if (!data.open) {
      closeDialog();
    }
  };

  const getTransactionCount = (item: Category | SubCategory): number => {
    if (item instanceof Category) {
      const categorySubCategories = subCategories.filter(sc => sc.category.id === item.id);
      return transactions.filter(t => 
        categorySubCategories.some(sc => sc.id === t.subCategory?.id)
      ).length;
    } else {
      return transactions.filter(t => t.subCategory?.id === item.id).length;
    }
  };

  const canDelete = (item: Category | SubCategory): boolean => {
    return getTransactionCount(item) === 0;
  };

  const handleSave = async () => {
    if (!tenantId || !formName.trim()) return;

    setSaving(true);
    try {
      await database(tenantId).write(async () => {
        switch (dialogState.type) {
          case 'add-category':
            await database(tenantId).collections.get<Category>(TableName.Categories).create(category => {
              category.name = formName.trim();
              category.type = dialogState.parentType || CategoryType.Needs;
              category.monthlyLimit = 0;
              category.yearlyLimit = 0;
            });
            break;

          case 'edit-category':
            if (dialogState.item) {
              await (dialogState.item as Category).update(category => {
                category.name = formName.trim();
              });
            }
            break;

          case 'move-category':
            if (dialogState.item) {
              await (dialogState.item as Category).update(category => {
                category.type = formType;
              });
            }
            break;

          case 'add-subcategory':
            if (dialogState.parentCategory) {
              await database(tenantId).collections.get<SubCategory>(TableName.SubCategories).create(subCategory => {
                subCategory.name = formName.trim();
                if (dialogState.parentCategory) {
                  subCategory.category.set(dialogState.parentCategory);
                }
              });
            }
            break;

          case 'edit-subcategory':
            if (dialogState.item) {
              await (dialogState.item as SubCategory).update(subCategory => {
                subCategory.name = formName.trim();
              });
            }
            break;

          case 'move-subcategory':
            if (dialogState.item && formParentCategory) {
              const newParentCategory = categories.find(c => c.id === formParentCategory);
              if (newParentCategory) {
                await (dialogState.item as SubCategory).update(subCategory => {
                  subCategory.category.set(newParentCategory);
                });
              }
            }
            break;

          case 'delete-category':
            if (dialogState.item && canDelete(dialogState.item)) {
              // Delete all subcategories first
              const categorySubCategories = subCategories.filter(sc => sc.category.id === dialogState.item?.id);
              for (const subCategory of categorySubCategories) {
                await subCategory.markAsDeleted();
              }
              await dialogState.item.markAsDeleted();
            }
            break;

          case 'delete-subcategory':
            if (dialogState.item && canDelete(dialogState.item)) {
              await dialogState.item.markAsDeleted();
            }
            break;
        }
      });
      closeDialog();
    } catch (error) {
      console.error('Error saving classification:', error);
    } finally {
      setSaving(false);
    }
  };

  // Group subcategories by category
  const subcategoriesByCategory = subCategories.reduce((groups, subCategory) => {
    const categoryId = subCategory.category.id;
    if (!groups[categoryId]) {
      groups[categoryId] = [];
    }
    groups[categoryId].push(subCategory);
    return groups;
  }, {} as Record<string, SubCategory[]>);

  // Define the order and colors for category types with gradient configurations
  const categoryTypeConfig = {
    [CategoryType.Needs]: { 
      color: tokens.colorPaletteRedBackground2, 
      order: 1
    },
    [CategoryType.Wants]: { 
      color: tokens.colorPaletteYellowBackground2, 
      order: 2
    },
    [CategoryType.Savings]: { 
      color: tokens.colorPaletteGreenBackground2, 
      order: 3
    },
    [CategoryType.Income]: { 
      color: tokens.colorPaletteBlueBackground2, 
      order: 4
    }
  };

  // Group categories by type
  const categoriesByType = categories.reduce((groups, category) => {
    const type = category.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(category);
    return groups;
  }, {} as Record<CategoryType, Category[]>);

  // Ensure all category types are present, even if empty
  Object.values(CategoryType).forEach(type => {
    if (!categoriesByType[type]) {
      categoriesByType[type] = [];
    }
  });

  // Sort the groups by the defined order - use all category types, not just the ones with data
  const sortedTypeKeys = Object.values(CategoryType).sort((a, b) => {
    const orderA = categoryTypeConfig[a as CategoryType]?.order || 999;
    const orderB = categoryTypeConfig[b as CategoryType]?.order || 999;
    return orderA - orderB;
  }) as CategoryType[];

  const renderDialogContent = () => {
    switch (dialogState.type) {
      case 'add-category':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category Name
            </label>
            <Input
              placeholder="Enter category name"
              value={formName}
              onChange={(e, data) => setFormName(data.value)}
              className="w-full"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: 'rgba(107, 114, 128, 0.5)'
              }}
            />
            <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Category Type:</strong> {dialogState.parentType || CategoryType.Needs}
              </p>
            </div>
          </div>
        );

      case 'edit-category':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category Name
            </label>
            <Input
              placeholder="Enter category name"
              value={formName}
              onChange={(e, data) => setFormName(data.value)}
              className="w-full"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: 'rgba(107, 114, 128, 0.5)'
              }}
            />
          </div>
        );

      case 'add-subcategory':
      case 'edit-subcategory':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subcategory Name
            </label>
            <Input
              placeholder="Enter subcategory name"
              value={formName}
              onChange={(e, data) => setFormName(data.value)}
              className="w-full"
              style={{ 
                backgroundColor: 'transparent',
                borderColor: 'rgba(107, 114, 128, 0.5)'
              }}
            />
          </div>
        );

      case 'move-category':
        return (
          <div className="space-y-4">
            <div className="bg-blue-500/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Moving:</strong> {dialogState.item?.name}
              </p>
              <p className="text-blue-300 text-xs mt-1">
                Current Type: {(dialogState.item as Category)?.type}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Move to Category Type
              </label>
              <Select
                value={formType}
                onChange={(e, data) => setFormType(data.value as CategoryType)}
                className="w-full"
              >
                {Object.values(CategoryType).map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        );

      case 'move-subcategory':
        return (
          <div className="space-y-4">
            <div className="bg-blue-500/10 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <strong>Moving:</strong> {dialogState.item?.name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Move to Category
              </label>
              <Select
                value={formParentCategory}
                onChange={(e, data) => setFormParentCategory(data.value)}
                className="w-full"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.type} - {category.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        );

      case 'delete-category':
      case 'delete-subcategory': {
        const transactionCount = dialogState.item ? getTransactionCount(dialogState.item) : 0;
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-4">
                <DeleteRegular className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete <strong>"{dialogState.item?.name}"</strong>?
              </p>
            </div>
            
            {transactionCount > 0 ? (
              <div className="bg-red-500/10 rounded-lg p-4">
                <p className="text-red-200 text-sm font-medium">
                  ⚠️ Cannot delete this {dialogState.type === 'delete-category' ? 'category' : 'subcategory'}
                </p>
                <p className="text-red-300 text-sm mt-1">
                  It has {transactionCount} linked transaction{transactionCount !== 1 ? 's' : ''}. 
                  Remove or reassign these transactions first.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-500/10 rounded-lg p-4">
                <p className="text-yellow-200 text-sm">
                  ⚠️ This action cannot be undone.
                </p>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getDialogTitle = () => {
    switch (dialogState.type) {
      case 'add-category': return 'Add Category';
      case 'edit-category': return 'Edit Category';
      case 'add-subcategory': return 'Add Subcategory';
      case 'edit-subcategory': return 'Edit Subcategory';
      case 'move-subcategory': return 'Move Subcategory';
      case 'move-category': return 'Move Category';
      case 'delete-category': return 'Delete Category';
      case 'delete-subcategory': return 'Delete Subcategory';
      default: return '';
    }
  };

  return (
    <div className="p-6 app-content-height">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            appearance="subtle" 
            icon={<ChevronLeftRegular />}
            onClick={handleBack}
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Classification Settings</h1>
            <p className="text-gray-400">Manage categories, subcategories, and organize your transactions</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-6 w-full">
        {sortedTypeKeys.map(categoryType => {
          const typeCategories = categoriesByType[categoryType];
          const typeConfig = categoryTypeConfig[categoryType];
          
          const panelGradient = `linear-gradient(135deg, 
            color-mix(in srgb, ${typeConfig.color} 25%, transparent) 0%, 
            color-mix(in srgb, ${typeConfig.color} 15%, transparent) 50%, 
            color-mix(in srgb, ${typeConfig.color} 10%, transparent) 100%)`;

          const radialOverlay = `radial-gradient(circle at 20% 80%, 
            color-mix(in srgb, ${typeConfig.color} 30%, transparent) 0%, 
            transparent 60%)`;

          return (
            <div 
              key={categoryType} 
              className="rounded-lg border border-gray-600/30 overflow-hidden h-fit relative"
              style={{ 
                background: panelGradient,
                border: `1px solid color-mix(in srgb, ${typeConfig.color} 30%, transparent)`,
                boxShadow: `0 4px 12px color-mix(in srgb, ${typeConfig.color} 20%, transparent), inset 0 1px 0 color-mix(in srgb, ${typeConfig.color} 30%, transparent)`
              }}
            >
              {/* Radial gradient overlay like account cards */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-lg"
                style={{ 
                  background: radialOverlay,
                  opacity: 0.8
                }}
              />
                  {/* Category Type Header */}
                  <div 
                    className="px-3 py-3 flex flex-col gap-2 border-b border-gray-600/20"
                    style={{ 
                      background: `linear-gradient(135deg, 
                        color-mix(in srgb, ${typeConfig.color} 40%, transparent) 0%, 
                        color-mix(in srgb, ${typeConfig.color} 25%, transparent) 50%, 
                        color-mix(in srgb, ${typeConfig.color} 20%, transparent) 100%)`,
                      borderBottom: `1px solid color-mix(in srgb, ${typeConfig.color} 40%, transparent)`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold text-lg leading-tight tracking-wide">{categoryType}</h3>
                        {typeCategories.length > 0 && (
                          <Tooltip content={`${typeCategories.reduce((sum, cat) => sum + (subcategoriesByCategory[cat.id] || []).reduce((subSum, sc) => subSum + getTransactionCount(sc), 0), 0)} total transactions`} relationship="label">
                            <span className="text-gray-400 text-xs bg-gray-600/30 px-2 py-1 rounded-full flex items-center gap-1">
                              <ArrowSwapRegular className="w-3 h-3" />
                              {typeCategories.reduce((sum, cat) => sum + (subcategoriesByCategory[cat.id] || []).reduce((subSum, sc) => subSum + getTransactionCount(sc), 0), 0)}
                            </span>
                          </Tooltip>
                        )}
                      </div>
                      <div>
                        <Tooltip content="Add category" relationship="label">
                          <div>
                            <CustomButton
                              variant="subtle"
                              size="small"
                              icon={<AddRegular />}
                              onClick={() => openDialog('add-category', undefined, categoryType)}
                              className="hover:bg-gray-600/50 border border-gray-600/50 text-xs py-1 px-1 h-6 w-6"
                            >
                              {""}
                            </CustomButton>
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  {/* Categories List */}
                  <div className="divide-y divide-gray-700/40">
                    {typeCategories.length === 0 ? (
                      <div className="px-6 py-8 text-center">
                        <div className="flex justify-center mb-4">
                          <EmptyStateIcon className="w-12 h-12 text-gray-500" />
                        </div>
                        <h4 className="text-gray-400 font-medium mb-2">No Categories Yet</h4>
                        <p className="text-gray-500 text-sm mb-4">
                          Create your first {categoryType.toLowerCase()} category to organize your transactions
                        </p>
                        <div className="flex justify-center">
                          <CustomButton
                            variant="subtle"
                            icon={<AddRegular />}
                            onClick={() => openDialog('add-category', undefined, categoryType)}
                            className="hover:bg-gray-600/50 border border-gray-600/50 text-sm py-2 px-4"
                          >
                            Add Category
                          </CustomButton>
                        </div>
                      </div>
                    ) : (
                      typeCategories.map(category => {
                      const categorySubCategories = subcategoriesByCategory[category.id] || [];
                      
                      return (
                        <div 
                          key={category.id} 
                          className="group transition-colors"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `color-mix(in srgb, ${typeConfig.color} 10%, transparent)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {/* Category Header */}
                          <div className="px-3 py-3 transition-colors border-b border-gray-600/20">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <h4 className="text-white font-bold text-base leading-tight tracking-wide">{category.name}</h4>
                                {categorySubCategories.length > 0 && (
                                  <Tooltip content={`${categorySubCategories.reduce((sum, sc) => sum + getTransactionCount(sc), 0)} total transactions`} relationship="label">
                                    <span className="text-gray-400 text-xs bg-gray-600/30 px-2 py-1 rounded-full flex items-center gap-1">
                                      <ArrowSwapRegular className="w-3 h-3" />
                                      {categorySubCategories.reduce((sum, sc) => sum + getTransactionCount(sc), 0)}
                                    </span>
                                  </Tooltip>
                                )}
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip content="Add subcategory" relationship="label">
                                  <div>
                                    <CustomButton
                                      variant="subtle"
                                      size="small"
                                      icon={<AddRegular />}
                                      onClick={() => openDialog('add-subcategory', undefined, undefined, category)}
                                      className="hover:bg-gray-600/50 border border-gray-500/30 text-gray-200 text-xs py-1 px-1 h-6 w-6"
                                    >
                                      {""}
                                    </CustomButton>
                                  </div>
                                </Tooltip>
                                <Tooltip content="Edit category" relationship="label">
                                  <div>
                                    <CustomButton
                                      variant="subtle"
                                      size="small"
                                      icon={<EditRegular />}
                                      onClick={() => openDialog('edit-category', category)}
                                      className="hover:bg-gray-600/50 border border-gray-500/30 text-xs py-1 px-1 h-6 w-6"
                                    >
                                      {""}
                                    </CustomButton>
                                  </div>
                                </Tooltip>
                                <Tooltip content="Move category" relationship="label">
                                  <div>
                                    <CustomButton
                                      variant="subtle"
                                      size="small"
                                      icon={<ArrowMoveRegular />}
                                      onClick={() => openDialog('move-category', category)}
                                      className="hover:bg-gray-600/50 border border-gray-500/30 text-xs py-1 px-1 h-6 w-6"
                                    >
                                      {""}
                                    </CustomButton>
                                  </div>
                                </Tooltip>
                                <Tooltip content={!canDelete(category) ? "Cannot delete category with transactions" : "Delete category"} relationship="label">
                                  <div>
                                    <CustomButton
                                      variant="subtle"
                                      size="small"
                                      icon={<DeleteRegular />}
                                      onClick={() => openDialog('delete-category', category)}
                                      disabled={!canDelete(category)}
                                      className={`text-xs py-1 px-1 h-6 w-6 border ${!canDelete(category) 
                                        ? 'border-gray-600/30 text-gray-500 opacity-30' 
                                        : 'hover:bg-red-600/30 border-red-500/30 text-red-200'
                                      }`}
                                    >
                                      {""}
                                    </CustomButton>
                                  </div>
                                </Tooltip>
                              </div>
                            </div>
                          </div>

                          {/* Subcategories */}
                          {categorySubCategories.length > 0 ? (
                            <div className="border-t border-gray-700/30">
                              <div className="px-3 py-2">
                                <div className="space-y-1">
                                  {categorySubCategories.map(subCategory => {
                                    const transactionCount = getTransactionCount(subCategory);
                                    return (
                                      <div 
                                        key={subCategory.id} 
                                        className="group/sub hover:bg-gray-700/10 transition-colors"
                                      >
                                        <div className="px-4 py-2">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 pl-4">
                                              <CustomAvatar 
                                                size={26}
                                                char={subCategory.name.charAt(0)}
                                                color={pickRandomByHash(subCategory.name, fluentColors)}
                                              />
                                              <span className="text-gray-300 text-sm leading-tight font-normal">{subCategory.name}</span>
                                              <Tooltip content={`${transactionCount} ${transactionCount === 1 ? 'transaction' : 'transactions'}`} relationship="label">
                                                <span className="text-gray-500 text-xs bg-gray-700/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                  <ArrowSwapRegular className="w-2.5 h-2.5" />
                                                  {transactionCount}
                                                </span>
                                              </Tooltip>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                              <Tooltip content="Edit subcategory" relationship="label">
                                                <div>
                                                  <CustomButton
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<EditRegular />}
                                                    onClick={() => openDialog('edit-subcategory', subCategory)}
                                                    className="hover:bg-gray-600/50 border border-gray-500/30 text-xs py-1 px-1 h-6 w-6"
                                                  >
                                                    {""}
                                                  </CustomButton>
                                                </div>
                                              </Tooltip>
                                              <Tooltip content="Move to another category" relationship="label">
                                                <div>
                                                  <CustomButton
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<ArrowMoveRegular />}
                                                    onClick={() => openDialog('move-subcategory', subCategory)}
                                                    className="hover:bg-gray-600/50 border border-gray-500/30 text-gray-200 text-xs py-1 px-1 h-6 w-6"
                                                  >
                                                    {""}
                                                  </CustomButton>
                                                </div>
                                              </Tooltip>
                                              <Tooltip content={!canDelete(subCategory) ? "Cannot delete subcategory with transactions" : "Delete subcategory"} relationship="label">
                                                <div>
                                                  <CustomButton
                                                    variant="subtle"
                                                    size="small"
                                                    icon={<DeleteRegular />}
                                                    onClick={() => openDialog('delete-subcategory', subCategory)}
                                                    disabled={!canDelete(subCategory)}
                                                    className={`text-xs py-1 px-1 h-6 w-6 border ${!canDelete(subCategory) 
                                                      ? 'border-gray-600/30 text-gray-500 opacity-30' 
                                                      : 'hover:bg-red-600/30 border-red-500/30 text-red-200'
                                                    }`}
                                                  >
                                                    {""}
                                                  </CustomButton>
                                                </div>
                                              </Tooltip>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="border-t border-gray-700/30 px-6 py-6 text-center">
                              <div className="flex justify-center mb-3">
                                <EmptyStateIcon className="w-8 h-8 text-gray-500" />
                              </div>
                              <p className="text-gray-500 text-xs mb-3">
                                No subcategories yet. Add one to organize transactions within this category.
                              </p>
                              <div className="flex justify-center">
                                <CustomButton
                                  variant="subtle"
                                  size="small"
                                  icon={<AddRegular />}
                                  onClick={() => openDialog('add-subcategory', undefined, undefined, category)}
                                  className="hover:bg-gray-600/50 border border-gray-500/30 text-xs py-1 px-3"
                                >
                                  Add Subcategory
                                </CustomButton>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }))}
                  </div>
                </div>
            );
            })}
        </div>

      {withDialogTheme(
        <Dialog open={dialogState.isOpen} onOpenChange={handleDialogOpenChange}>
          <DialogSurface className="max-w-md">
            <DialogBody>
              <DialogTitle className="text-xl font-semibold text-white mb-4">
                {getDialogTitle()}
              </DialogTitle>
              <DialogContent className="space-y-4">
                {renderDialogContent()}
              </DialogContent>
              <DialogActions className="pt-6 mt-6">
                <div className="flex gap-3 w-full justify-end">
                  <DialogTrigger disableButtonEnhancement>
                    <CustomButton 
                      variant="subtle" 
                      onClick={closeDialog}
                      className="hover:bg-gray-600/50 border border-gray-600/50"
                    >
                      Cancel
                    </CustomButton>
                  </DialogTrigger>
                  <CustomButton
                    variant="primary"
                    onClick={handleSave}
                    disabled={
                      saving || 
                      (!formName.trim() && !['delete-category', 'delete-subcategory', 'move-category'].includes(dialogState.type || '')) ||
                      (dialogState.type === 'move-subcategory' && !formParentCategory) ||
                      (['delete-category', 'delete-subcategory'].includes(dialogState.type || '') && dialogState.item && !canDelete(dialogState.item))
                    }
                    className={
                      ['delete-category', 'delete-subcategory'].includes(dialogState.type || '')
                        ? 'bg-red-600 hover:bg-red-700 border-red-500'
                        : 'bg-blue-600 hover:bg-blue-700 border-blue-500'
                    }
                  >
                    {saving ? 'Saving...' : 
                     ['delete-category', 'delete-subcategory'].includes(dialogState.type || '') ? 'Delete' : 'Save'}
                  </CustomButton>
                </div>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      )}
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(Q.sortBy('name')),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(Q.sortBy('name')),
  transactions: database(tenantId).collections.get<Transaction>('transactions').query(),
}));

const EnhancedDataClassificationSettingsPage = () => {
  const { tenantId } = useParams();
  const EnhancedDataClassificationSettingsPage = enhance(DataClassificationSettingsPage);
  return <EnhancedDataClassificationSettingsPage tenantId={tenantId} />;
};

export default EnhancedDataClassificationSettingsPage;
