import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface, DialogTrigger, Input, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import { ChevronDownRegular, DeleteRegular, DismissCircleRegular, SearchRegular } from "@fluentui/react-icons";
import { Q } from '@nozbe/watermelondb';
import { withObservables } from '@nozbe/watermelondb/react';
import { AutocompleteSelectCellEditor } from 'ag-grid-autocomplete-editor';
import { AllCommunityModule, CellEditRequestEvent, ColDef, colorSchemeDark, ModuleRegistry, themeAlpine } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import CustomAvatar from '../../common/CustomAvatar';
import CustomButton from '../../common/CustomButton';
import Money from '../../common/Money';
import { dateTimeFormat, fluentColors, moneyFormat } from '../../constants';
import database from '../../db/database';
import Account from '../../db/models/Account';
import Category from '../../db/models/Category';
import SubCategory from '../../db/models/SubCategory';
import Transaction from '../../db/models/Transaction';
import TableName from '../../db/TableName';
import { pickRandomByHash } from '../../utils/Common';
import { unsubscribeAll, useForceUpdate } from '../../utils/ComponentUtils';
import { subscribeTo } from '../../utils/GlobalVariable';
import { convertToTransactionRows, TransactionRow, updateTransactionRow } from '../../utils/TransactionHelpers';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface TransactionsPageProps {
  accounts: Array<Account>;
  categories: Array<Category>;
  subCategories: Array<SubCategory>;
  transactions: Array<Transaction>;
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

const AccountCircle = ({ name }: { name: string }) => {
  const color = pickRandomByHash(name, fluentColors);
  return (
    <CustomAvatar 
      size={26} 
      char={name.charAt(0)} 
      shape="square"
      color={color}
    />
  );
};

const TransactionsPage: React.FC<TransactionsPageProps> = ({ accounts, categories, subCategories, transactions }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tenantId, accountId } = useParams();
  const [searchText, setSearchText] = React.useState('');
  const [selectedTransactionIds, setSelectedTransactionIds] = React.useState<string[]>([]);
  const [isPortrait, setIsPortrait] = React.useState(false);
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const screenSubscription = subscribeTo('isScreenLandscape', (b) => setIsPortrait(!b));
    return unsubscribeAll(screenSubscription);
  }, []);

  const account = accounts.find(a => a.id === accountId);
  const all = 'all';
  const theme = themeAlpine.withPart(colorSchemeDark)
    .withParams({
      spacing: 5,
      backgroundColor: 'var(--colorNeutralBackground1)'
    });
  const transactionRows = convertToTransactionRows(transactions, selectedTransactionIds, account?.initialBalance ?? 0);

  const classificationOptions = [...subCategories.map(s => ({
    value: JSON.stringify({ subCategoryId: s.id }),
    label: s.name + " • " + categories.find(c => c.id === s.category.id)?.name
  })), ...accounts.map(a => ({
    value: JSON.stringify({ transferAccountId: a.id }),
    label: a.name
  }))];

  function getClassificationTitle(classification: string): string {
    if (!classification) return '';
    try {
      const parsed = JSON.parse(classification);
      if (parsed.subCategoryId) {
        const subCategory = subCategories.find(s => s.id === parsed.subCategoryId);
        const category = subCategory ? categories.find(c => c.id === subCategory.category.id) : null;
        if (category && subCategory) {
          return `${category.name} > ${subCategory.name}`;
        }
      }
      if (parsed.transferAccountId) {
        const account = accounts.find(a => a.id === parsed.transferAccountId);
        return account ? account.name : '';
      }
    } catch (e) {
      console.error('Error parsing classification:', e);
    }
    return '';
  }

  const AccountRenderer = ({ account }: { account: Account | undefined }) => {
    if (!account) return <span>-</span>;
    return (
      <div className="flex items-center gap-2">
        <AccountCircle name={account.name} />
        <span>{account.name}</span>
      </div>
    );
  };

  const SubCategoryRenderer = ({ subCategory, category }: { subCategory: SubCategory | undefined, category: Category | undefined }) => {
    if (!subCategory || !category) return <span>-</span>;
    const color = pickRandomByHash(subCategory.name, fluentColors);
    return (
      <div className="flex items-center gap-2">
        <CustomAvatar 
          size={26} 
          char={subCategory.name.charAt(0)} 
          shape="circle"
          color={color}
        />
        <span className="font-medium">{subCategory.name}</span>
        <span className="text-gray-400 text-xs">{category.name}</span>
      </div>
    );
  };

  const ClassificationRenderer = ({ transaction }: { transaction: Transaction }) => {
    if (transaction.subCategory?.id) {
      const subCategory = subCategories.find(s => s.id === transaction.subCategory?.id);
      const category = categories.find(c => c.id === subCategory?.category.id);
      return <SubCategoryRenderer subCategory={subCategory} category={category} />
    }
    if (transaction.transferAccount?.id) {
      return <AccountRenderer account={accounts.find(a => a.id === transaction.transferAccount?.id)} />
    }
    return <></>
  };

  const columns: ColDef<TransactionRow>[] = [
    {
      width: 50,
      field: 'selected',
      editable: true,
      headerComponent: SelectAllHeader,
    },
    {
      minWidth: 150,
      width: 180,
      headerName: t('app.account'),
      field: 'raw.account',
      hide: account !== undefined,
      cellRendererSelector: params => ({
        params: { account: accounts.find(a => a.id === params.data?.raw.account.id) },
        component: AccountRenderer
      })
    },
    {
      minWidth: 200,
      width: 230,
      headerName: t('app.subCategory'),
      field: 'classification',
      editable: true,
      cellEditor: AutocompleteSelectCellEditor,
      cellEditorParams: { selectData: classificationOptions },
      valueGetter: (row) => getClassificationTitle(row.data?.classification || ''),
      cellRendererSelector: params => ({
        params: { transaction: params.data?.raw },
        component: ClassificationRenderer
      })
    },
    {
      width: 100,
      headerName: t('app.date'),
      field: 'date',
      editable: true,
      valueFormatter: param => dateTimeFormat.format(param.value as Date)
    },
    {
      minWidth: 150,
      headerName: t('app.title'),
      field: 'title',
      flex: 1,
      editable: true
    },
    {
      width: 100,
      headerName: t('app.withdraw'),
      field: 'withdraw',
      editable: true,
      valueFormatter: param => param.value !== 0 ? moneyFormat.format(param.value) : ''
    },
    {
      width: 100,
      headerName: t('app.deposit'),
      field: 'deposit',
      editable: true,
      valueFormatter: param => param.value !== 0 ? moneyFormat.format(param.value) : ''
    },
    {
      width: 150,
      headerName: t('app.balance'),
      field: 'balance',
      hide: account === undefined,
      editable: true,
      valueFormatter: param => param.value !== 0 ? moneyFormat.format(param.value) : ''
    },
  ];

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const deleteTransactions = async () => {
    if (!tenantId) return;
    await database(tenantId).write(async () => {
      const selectedTransactions = selectedTransactionIds
        .map(id => transactions.find(t => t.id === id))
      selectedTransactions.forEach(t => t?.markAsDeleted());
    });
    // Reset selection and close dialog
    setSelectedTransactionIds([]);
    setDeleteDialogOpen(false);
  }

  const handleChanges = async (event: CellEditRequestEvent<TransactionRow>) => {
    if (!tenantId) return;
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

    if (!colDef.field) return;

    await updateTransactionRow(tenantId, transactionRow, colDef.field, updatedValue);
    forceUpdate();
  }



  return (
    <>
      <div className='flex flex-col app-content-height'>
        <div className='m-2 flex flex-row gap-2 flex-wrap'>
          <Menu>
            <MenuTrigger>
          <div className='flex flex-row gap-2 items-center text-xl'>
            <CustomAvatar 
              size={26} 
              char={(account?.name ?? all).charAt(0)} 
              shape="square"
              color={pickRandomByHash(account?.name ?? all, fluentColors)}
            />
                {account ? account.name : t('app.all')} <ChevronDownRegular />
          </div>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem 
                  icon={<CustomAvatar size={26} char={all.charAt(0)} shape="square" color={pickRandomByHash(all, fluentColors)} />}
                  onClick={() => navigate(`/tenants/${tenantId}/transactions/${all}`)}
                >
                  {t('app.all')}
                </MenuItem>
                {accounts.map(a => (
                  <MenuItem 
                    key={a.id}
                    icon={<CustomAvatar size={26} char={a.name.charAt(0)} shape="square" color={pickRandomByHash(a.name, fluentColors)} />}
                    onClick={() => navigate(`/tenants/${tenantId}/transactions/${a.id}`)}
                  >
                    {a.name}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuPopover>
          </Menu>
          <div className={!isPortrait ? 'grow' : ''}>
            <Input 
              className={isPortrait ? 'input-button-expandable' : ''} 
              contentBefore={<SearchRegular />}
              placeholder={t('app.search')} 
              onChange={(e, data) => setSearchText(data.value)} 
            />
          </div>
          <div className="flex flex-row gap-2">
            {selectedTransactionIds.length > 0 &&
              <Dialog open={deleteDialogOpen} onOpenChange={(e, data) => setDeleteDialogOpen(data.open)}>
                <DialogTrigger>
                  <CustomButton icon={<DeleteRegular />} variant="danger" onClick={() => setDeleteDialogOpen(true)}>{t('app.delete')}</CustomButton>
                </DialogTrigger>
                <DialogSurface>
                  <DialogBody>
                    <DialogContent>
                      <div className="flex items-center gap-2 mb-4">
                        <DismissCircleRegular style={{ color: 'red' }} />
                        <span className="font-semibold">{t('app.delete')} {t('app.transactions')} ?</span>
                      </div>
                      <p>{t('app.deleteConfirmation', { entity: t('app.transactions') })}</p>
                    </DialogContent>
                    <DialogActions>
                      <Button appearance="subtle" onClick={() => setDeleteDialogOpen(false)}>{t('app.no')}</Button>
                      <Button appearance="primary" onClick={deleteTransactions}>{t('app.yes')}</Button>
                    </DialogActions>
                  </DialogBody>
                </DialogSurface>
              </Dialog>
            }

            {account && <div className='flex flex-row items-center gap-2'>
              <span className='text-sm' style={{ color: 'var(--ant-color-text-description)' }}>{t('app.currentBalance')}</span>
              <span className='text-xl'><Money amount={transactionRows[0]?.balance} /></span>
            </div>}
          </div>
        </div>
        <AgGridReact<TransactionRow>
          theme={theme}
          quickFilterText={searchText}
          readOnlyEdit={true}
          onCellEditRequest={handleChanges}
          rowData={transactionRows}
          columnDefs={columns}
          context={{ selectedTransactionIds, setSelectedTransactionIds, transactionRows }} />
      </div>
    </>
  );
};

const enhance = withObservables(['tenantId', 'accountId'], ({ tenantId, accountId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(),
  categories: database(tenantId).collections.get<Category>(TableName.Categories).query(),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(),
  transactions: accountId && accountId !== 'all' 
    ? database(tenantId).collections.get<Transaction>(TableName.Transactions)
        .query(Q.where('account_id', accountId), Q.sortBy('transaction_at'))
    : database(tenantId).collections.get<Transaction>(TableName.Transactions)
        .query(Q.sortBy('transaction_at'))
}));
const EnhancedTransactionsPage = () => {
  const { tenantId, accountId } = useParams();
  const EnhancedTransactionsPage = enhance(TransactionsPage);
  return <EnhancedTransactionsPage tenantId={tenantId} accountId={accountId} />;
}
export default EnhancedTransactionsPage;