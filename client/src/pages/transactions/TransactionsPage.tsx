import { AgGridReact } from 'ag-grid-react';
import { ColDef, AllCommunityModule, ModuleRegistry, colorSchemeDark, themeAlpine, CellEditRequestEvent } from 'ag-grid-community';
import { AutocompleteSelectCellEditor } from 'ag-grid-autocomplete-editor';
import { convertToTransactionRows, TransactionRow, updateTransactionRow } from '../../utils/TransactionHelpers';
import { Database, Q } from '@nozbe/watermelondb';
import { dateTimeFormat, moneyFormat } from '../../constants';
import { CloseCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Drawer, Dropdown, Input, Popconfirm } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withObservables, withDatabase } from '@nozbe/watermelondb/react';
import Account from '../../db/models/Account';
import React from 'react';
import SubCategory from '../../db/models/SubCategory';
import TableName from '../../db/TableName';
import Transaction from '../../db/models/Transaction';
import Money from '../../common/Money';
import IconButton from '../../common/IconButton';
import ImportPage from '../accounts/import/ImportPage';
import { useForceUpdate } from '../../utils/ComponentUtils';
import database from '../../db/database';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

interface TransactionsPageProps {
  accounts: Array<Account>;
  subCategories: Array<SubCategory>;
  transactions: Array<Transaction>;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ accounts, subCategories, transactions }) => {

  const all = 'all';
  const { t } = useTranslation();
  const { accountId } = useParams();
  const navigate = useNavigate();
  const forceUpdate = useForceUpdate();
  const [importDrawerOpen, setImportDrawerOpen] = React.useState<boolean>(false);
  const [selectedTransactionIds, setSelectedTransactionIds] = React.useState<string[]>([]);
  const [searchText, setSearchText] = React.useState<string>('');
  const account = accountId !== all ? accounts.find(a => a.id === accountId) : undefined;
  const transactionRows = convertToTransactionRows(transactions
    .filter(t => account === undefined || t.account.id === account.id),
    selectedTransactionIds, account?.initialBalance ?? 0);
  const theme = themeAlpine.withPart(colorSchemeDark)
    .withParams({
      spacing: 3,
      backgroundColor: '#141414'
    })


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getClassificationTitle(classification: any): string {
    if (!classification) {
      return '';
    }
    if (classification.value) {
      classification = classification.value;
    }
    const classificationObj = JSON.parse(classification);
    if (classificationObj.subCategoryId) {
      const subCategory = subCategories.find(s => s.id === classificationObj.subCategoryId);
      return subCategory?.name || '';
    } else if (classificationObj.transferAccountId) {
      const account = accounts.find(a => a.id === classificationObj.transferAccountId);
      return account?.name || '';
    } else {
      return '';
    }
  }
  const classificationOptions = [...subCategories.map(s => ({
    value: JSON.stringify({ subCategoryId: s.id }),
    label: s.name
  })), ...accounts.map(a => ({
    value: JSON.stringify({ transferAccountId: a.id }),
    label: a.name
  }))];

  const columns: Array<ColDef<TransactionRow>> = [
    {
      width: 30,
      headerName: '',
      field: 'selected',
      editable: true,
      cellEditor: 'agCheckboxCellEditor',
    },
    {
      width: 60,
      headerName: '',
      valueGetter: 'node.rowIndex + 1'
    },
    {
      width: 150,
      headerName: t('app.account'),
      field: 'raw.account',
      hide: account !== undefined,
      valueGetter: (row) => accounts.find(a => a.id === row.data?.raw?.account?.id)?.name
    },
    {
      width: 150,
      headerName: t('app.subCategory'),
      field: 'classification',
      editable: true,
      cellEditor: AutocompleteSelectCellEditor,
      cellEditorParams: { selectData: classificationOptions },
      valueGetter: (row) => getClassificationTitle(row.data?.classification)
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

  const deleteTransactions = async () => {
    await database.write(async () => {
      const selectedTransactions = selectedTransactionIds
        .map(id => transactions.find(t => t.id === id))
      selectedTransactions.forEach(t => t?.markAsDeleted());
    });
  }

  const handleChanges = async (event: CellEditRequestEvent<TransactionRow>) => {
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

    await updateTransactionRow(transactionRow, colDef.field, updatedValue);
    forceUpdate();
  }

  return (
    <>
      <div className='flex flex-col app-content-height'>
        <div className='m-2 flex flex-row gap-2'>
          <Dropdown menu={{
            onClick: (selection) => navigate(`/transactions/${selection.key}`),
            items: [{ key: all, label: t('app.all') }, ...accounts.map(a => ({ key: a.id, label: a.name }))]
          }}>
            <div className='text-xl'>
              {account ? account.name : t('app.all')} <DownOutlined />
            </div>
          </Dropdown>
          <div className='grow' >
            <Input className='w-full' prefix={<SearchOutlined />}
              placeholder={t('app.search')} onChange={e => setSearchText(e.target.value)} />
          </div>
          <div className="flex flex-row gap-2">
            {selectedTransactionIds.length > 0 &&
              <Popconfirm
                title={`${t('app.delete')} ${t('app.transactions')} ?`}
                icon={<CloseCircleOutlined style={{ color: 'red' }} />}
                description={`${t('app.deleteConfirmation', { entity: t('app.transactions') })}`}
                onConfirm={deleteTransactions}
                placement='leftBottom'
                okText={t('app.yes')}
                cancelText={t('app.no')}>
                <IconButton icon={<DeleteOutlined />} danger>{t('app.delete')}</IconButton>
              </Popconfirm>
            }
            {account && <IconButton icon={<DownloadOutlined />} onClick={() => setImportDrawerOpen(true)}>{t('app.import')}</IconButton>}
          </div>
          {account && <div className='flex flex-row items-baseline gap-2'>
            <span className='text-sm' style={{ color: 'var(--ant-color-text-description)' }}>{t('app.currentBalance')}</span>
            <span className='text-xl'><Money amount={transactionRows[0].balance} /></span>
          </div>}
        </div>
        <AgGridReact<TransactionRow>
          theme={theme}
          quickFilterText={searchText}
          readOnlyEdit={true}
          onCellEditRequest={handleChanges}
          rowData={transactionRows}
          columnDefs={columns} />
      </div>
      <Drawer title={t('app.import')} closable={true} size='large' placement='right' onClose={() => setImportDrawerOpen(false)} open={importDrawerOpen}>
        {account && <ImportPage account={account} onClose={() => setImportDrawerOpen(false)} />}
      </Drawer>
    </>
  );
};

const enhance = withObservables([], ({ database }: { database: Database }) => ({
  accounts: database.collections.get<Account>(TableName.Accounts).query(),
  subCategories: database.collections.get<SubCategory>(TableName.SubCategories).query(),
  transactions: database.collections.get<Transaction>(TableName.Transactions).query(Q.sortBy('transaction_at'))
}));
const EnhancedTransactionsPage = withDatabase(enhance(TransactionsPage));
export default EnhancedTransactionsPage;