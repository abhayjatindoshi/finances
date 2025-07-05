import { Button, Text, tokens } from '@fluentui/react-components';
import { CheckmarkRegular, ChevronRightRegular, SparkleRegular } from '@fluentui/react-icons';
import { withObservables } from '@nozbe/watermelondb/react';
import { AutocompleteSelectCellEditor } from 'ag-grid-autocomplete-editor';
import { AllCommunityModule, CellEditRequestEvent, CellValueChangedEvent, ColDef, colorSchemeDark, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import CustomAvatar from '../../../common/CustomAvatar';
import { dateTimeFormat, fluentColors, moneyFormat } from '../../../constants';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import Category from '../../../db/models/Category';
import SubCategory from '../../../db/models/SubCategory';
import Transaction from '../../../db/models/Transaction';
import TableName from '../../../db/TableName';
import { ImportedTransaction } from '../../../services/import/import-adapter';
import { pickRandomByHash } from '../../../utils/Common';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface TransactionPreviewStepProps {
  accounts: Array<Account>;
  categories: Array<Category>;
  subCategories: Array<SubCategory>;
  transactions: Array<Transaction>;
  importedTransactions: ImportedTransaction[];
  setImportedTransactions: (transactions: ImportedTransaction[]) => void;
  selectedAccount: Account;
  onBack: () => void;
  onContinue: (selectedTransactions: ImportedTransaction[]) => void;
}

interface PreviewTransactionRow {
  selected: boolean;
  id: string;
  date: Date;
  title: string;
  withdraw: number;
  deposit: number;
  classification: string;
  balance: number;
  raw: ImportedTransaction;
}

// Custom header component for select all
const SelectAllHeader: React.FC<{ context: { selectedTransactionIds: string[]; setSelectedTransactionIds: (ids: string[]) => void; transactionRows: Array<{ id: string }> } }> = (props) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const { selectedTransactionIds, setSelectedTransactionIds, transactionRows } = props.context;

  useEffect(() => {
    const selectedCount = selectedTransactionIds.length;
    const totalCount = transactionRows.length;
    if (checkboxRef.current) {
      checkboxRef.current.checked = selectedCount > 0 && selectedCount === totalCount;
      checkboxRef.current.indeterminate = selectedCount > 0 && selectedCount < totalCount;
    }
  }, [selectedTransactionIds, transactionRows]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTransactionIds(transactionRows.map((row: { id: string }) => row.id));
    } else {
      setSelectedTransactionIds([]);
    }
  };

  return (
    <input
      type="checkbox"
      ref={checkboxRef}
      onChange={onChange}
      className="ag-input-field-input ag-checkbox-input"
      data-ref="eInput"
      aria-label="Press SPACE to toggle cell value (unchecked)"
      aria-live="polite"
      tabIndex={-1}
      style={{ height: 'var(--ag-icon-size)', width: 'var(--ag-icon-size)' }}
    />
  );
};

const TransactionPreviewStep: React.FC<TransactionPreviewStepProps> = ({
  accounts,
  categories,
  subCategories,
  transactions,
  importedTransactions,
  setImportedTransactions,
  selectedAccount,
  onBack,
  onContinue
}) => {
  const { t } = useTranslation();
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  // Select all transactions by default when component mounts
  useEffect(() => {
    if (importedTransactions.length > 0 && selectedTransactionIds.length === 0) {
      const allIds = importedTransactions.map(t => t.id.toString());
      setSelectedTransactionIds(allIds);
    }
  }, [importedTransactions, selectedTransactionIds.length]);

  const convertToPreviewRows = (transactions: ImportedTransaction[], selectedIds: string[], initialBalance: number): PreviewTransactionRow[] => {
    let prevBalance = initialBalance;
    const rows = transactions
      .sort((a, b) => a.transactionAt.getTime() - b.transactionAt.getTime())
      .map((transaction) => {
        const classification = (transaction as unknown as { classification?: string }).classification || '';
        
        const row: PreviewTransactionRow = {
          selected: selectedIds.includes(transaction.id.toString()),
          id: transaction.id.toString(),
          date: transaction.transactionAt,
          title: transaction.title,
          withdraw: transaction.amount < 0 ? -transaction.amount : 0,
          deposit: transaction.amount > 0 ? transaction.amount : 0,
          classification: classification,
          balance: prevBalance + transaction.amount,
          raw: transaction,
        };

        prevBalance = row.balance;
        return row;
      }).reverse();
    
    return rows;
  };

  const transactionRows = convertToPreviewRows(importedTransactions, selectedTransactionIds, selectedAccount.initialBalance);

  const classificationOptions = [...subCategories.map(s => ({
    value: JSON.stringify({ subCategoryId: s.id }),
    label: s.name + " • " + categories.find(c => c.id === s.category.id)?.name
  })), ...accounts.map(a => ({
    value: JSON.stringify({ transferAccountId: a.id }),
    label: a.name
  }))];

  const ClassificationRenderer = ({ transaction }: { transaction: ImportedTransaction }) => {
    const classification = (transaction as unknown as { classification?: string }).classification;
    
    if (!classification) {
      return <span style={{ opacity: 0.7 }}>-</span>;
    }
    
    try {
      const parsed = JSON.parse(classification);
      const isAutoDetected = parsed && parsed.autoDetected === true;
      
      if (parsed.subCategoryId) {
        const subCategory = subCategories.find(s => s.id === parsed.subCategoryId);
        const category = subCategory ? categories.find(c => c.id === subCategory.category.id) : null;
        if (category && subCategory) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CustomAvatar 
                size={20} 
                char={subCategory.name.charAt(0)} 
                shape="circle"
                color={pickRandomByHash(subCategory.name, fluentColors)}
              />
              <span style={{ fontSize: '14px' }}>{subCategory.name}</span>
              <span style={{ fontSize: '12px', opacity: 0.6 }}>{category.name}</span>
              {isAutoDetected && (
                <SparkleRegular 
                  style={{ 
                    fontSize: '12px', 
                    color: tokens.colorPaletteBlueForeground2,
                    marginLeft: '4px'
                  }} 
                  title="Auto-detected"
                />
              )}
            </div>
          );
        }
      }
      if (parsed.transferAccountId) {
        const account = accounts.find(a => a.id === parsed.transferAccountId);
        if (account) {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CustomAvatar 
                size={20} 
                char={account.name.charAt(0)} 
                shape="square"
                color={pickRandomByHash(account.name, fluentColors)}
              />
              <span style={{ fontSize: '14px' }}>{account.name}</span>
              {isAutoDetected && (
                <SparkleRegular 
                  style={{ 
                    fontSize: '12px', 
                    color: tokens.colorPaletteBlueForeground2,
                    marginLeft: '4px'
                  }} 
                  title="Auto-detected"
                />
              )}
            </div>
          );
        }
      }
    } catch (e) {
      console.error('Error parsing classification:', e);
    }
    
    return <span style={{ opacity: 0.7 }}>-</span>;
  };

  const columns: ColDef<PreviewTransactionRow>[] = [
    {
      width: 50,
      field: 'selected',
      editable: true,
      headerComponent: SelectAllHeader,
    },
    {
      minWidth: 250,
      headerName: t('app.subCategory'),
      field: 'classification',
      editable: true,
      cellEditor: AutocompleteSelectCellEditor,
      cellEditorParams: { selectData: classificationOptions },
      valueGetter: (row) => {
        const value = row.data?.classification || '';
        return value;
      },
      valueSetter: (params) => {
        // Extract the value from the AutocompleteSelectCellEditor result
        const classificationValue = params.newValue?.value || params.newValue || '';
        params.data.classification = classificationValue;
        return true;
      },
      cellRendererSelector: params => ({
        params: { transaction: params.data?.raw },
        component: ClassificationRenderer
      })
    },
    {
      width: 120,
      headerName: t('app.date'),
      field: 'date',
      editable: false,
      valueFormatter: param => dateTimeFormat.format(param.value as Date)
    },
    {
      minWidth: 200,
      headerName: t('app.title'),
      field: 'title',
      flex: 1,
      editable: false
    },
    {
      width: 120,
      headerName: t('app.withdraw'),
      field: 'withdraw',
      editable: false,
      valueFormatter: param => param.value !== 0 ? moneyFormat.format(param.value) : ''
    },
    {
      width: 120,
      headerName: t('app.deposit'),
      field: 'deposit',
      editable: false,
      valueFormatter: param => param.value !== 0 ? moneyFormat.format(param.value) : ''
    },
  ];

  const handleCellEditRequest = async (event: CellEditRequestEvent<PreviewTransactionRow>) => {
    const transactionRow = event.data;
    const colDef = event.colDef;
    const updatedValue = event.newValue;

    if (colDef.field === 'selected') {
      if (updatedValue) {
        setSelectedTransactionIds([...selectedTransactionIds, transactionRow.id]);
      } else {
        setSelectedTransactionIds(selectedTransactionIds.filter(id => id !== transactionRow.id));
      }
    }

    if (colDef.field === 'classification') {
      // Extract the value from the AutocompleteSelectCellEditor result
      const classificationValue = updatedValue?.value || updatedValue || '';
      
      // Remove autoDetected flag when user manually edits
      let finalClassification = classificationValue;
      if (classificationValue) {
        try {
          const parsed = JSON.parse(classificationValue);
          // Remove autoDetected flag for manual edits
          delete parsed.autoDetected;
          finalClassification = JSON.stringify(parsed);
        } catch (e) {
          // If parsing fails, use the original value
          finalClassification = classificationValue;
        }
      }
      
      // Store the classification in the transaction data
      const updatedTransactions = importedTransactions.map(transaction => {
        if (transaction.id.toString() === transactionRow.id) {
          const updatedTransaction = {
            ...transaction,
            classification: finalClassification
          };
          return updatedTransaction;
        }
        return transaction;
      });
      setImportedTransactions(updatedTransactions);
    }
  };

  const handleCellValueChanged = (event: CellValueChangedEvent<PreviewTransactionRow>) => {
    // Handle the same logic as edit request
    const cellEditRequestEvent: CellEditRequestEvent<PreviewTransactionRow> = {
      ...event,
      type: 'cellEditRequest',
      newValue: event.newValue
    };
    handleCellEditRequest(cellEditRequestEvent);
  };

  const theme = themeAlpine.withPart(colorSchemeDark)
    .withParams({
      spacing: 5,
      backgroundColor: 'var(--colorNeutralBackground1)'
    });

  return (
    <div style={{ 
      width: '100%',
      backgroundColor: 'var(--colorNeutralBackground1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      height: 'calc(100vh - 64px)'
    }}>
      {/* Header with controls */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '8px',
        padding: '16px 24px 0 24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button 
            appearance="subtle" 
            icon={<ChevronRightRegular />}
            onClick={onBack}
            style={{ transform: 'rotate(180deg)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CustomAvatar 
              size={32} 
              char={selectedAccount.name.charAt(0)} 
              shape="square"
              color={pickRandomByHash(selectedAccount.name, fluentColors)}
            />
            <Text style={{ 
              fontSize: '24px',
              fontWeight: '600',
              color: tokens.colorNeutralForeground1
            }}>
              {selectedAccount.name}
            </Text>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Text style={{ 
            fontSize: '14px',
            color: tokens.colorNeutralForeground1,
            opacity: 0.7
          }}>
            {selectedTransactionIds.length} of {importedTransactions.length} selected
          </Text>
          <Button
            appearance="primary"
            onClick={() => {
              const selectedTransactions = importedTransactions.filter(t => 
                selectedTransactionIds.includes(t.id.toString())
              );
              onContinue(selectedTransactions);
            }}
            icon={<CheckmarkRegular />}
            disabled={selectedTransactionIds.length === 0}
          >
            Import {selectedTransactionIds.length} Transactions
          </Button>
        </div>
      </div>

      {/* Full width table */}
      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <div style={{ height: '100%', width: '100%' }}>
          <AgGridReact<PreviewTransactionRow>
            theme={theme}
            readOnlyEdit={false}
            onCellEditRequest={handleCellEditRequest}
            onCellValueChanged={handleCellValueChanged}
            rowData={transactionRows}
            columnDefs={columns}
            context={{ selectedTransactionIds, setSelectedTransactionIds, transactionRows }}
          />
        </div>
      </div>
    </div>
  );
};

const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(),
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(),
  transactions: database(tenantId).collections.get<Transaction>(TableName.Transactions).query(),
}));

const EnhancedTransactionPreviewStep = (props: Omit<TransactionPreviewStepProps, 'accounts' | 'categories' | 'subCategories' | 'transactions'>) => {
  const { tenantId } = useParams();
  const EnhancedComponent = enhance(TransactionPreviewStep);
  return <EnhancedComponent tenantId={tenantId} {...props} />;
};

export default EnhancedTransactionPreviewStep; 