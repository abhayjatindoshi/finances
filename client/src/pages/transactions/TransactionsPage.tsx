import { AgGridReact } from 'ag-grid-react';
import { antColors, dateTimeFormat, moneyFormat } from '../../constants';
import { AutocompleteSelectCellEditor } from 'ag-grid-autocomplete-editor';
import { Avatar, Drawer, Dropdown, Input, Popconfirm } from 'antd';
import { CloseCircleOutlined, DeleteOutlined, DownloadOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { ColDef, AllCommunityModule, ModuleRegistry, colorSchemeDark, themeAlpine, CellEditRequestEvent } from 'ag-grid-community';
import { convertToTransactionRows, TransactionRow, updateTransactionRow } from '../../utils/TransactionHelpers';
import { pickRandomByHash } from '../../utils/Common';
import { Q } from '@nozbe/watermelondb';
import { useForceUpdate } from '../../utils/ComponentUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { withObservables } from '@nozbe/watermelondb/react';
import Account from '../../db/models/Account';
import database from '../../db/database';
import IconButton from '../../common/IconButton';
import ImportPage from './import/ImportPage';
import Money from '../../common/Money';
import React from 'react';
import SubCategory from '../../db/models/SubCategory';
import TableName from '../../db/TableName';
import Transaction from '../../db/models/Transaction';

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
  const { accountId, tenantId } = useParams();
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
      spacing: 5,
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

  const AccountRenderer = ({ account }: { account: Account | undefined }) => {
    if (!account) return <></>
    return <div className='flex flex-row items-center gap-2'>
      <Avatar size={'small'} shape='square' style={{ backgroundColor: `var(--ant-${pickRandomByHash(account.name, antColors)}-6)` }} >{account.name.charAt(0).toUpperCase()}</Avatar>
      {account.name}
    </div>
  }

  const SubCategoryRenderer = ({ subCategory }: { subCategory: SubCategory | undefined }) => {
    if (!subCategory) return <></>
    return <div className='flex flex-row items-center gap-2'>
      <Avatar size={'small'} shape='circle' style={{ backgroundColor: `var(--ant-${pickRandomByHash(subCategory.name, antColors)}-6)` }} >{subCategory.name.charAt(0).toUpperCase()}</Avatar>
      {subCategory.name}
    </div>
  }

  const ClassificationRenderer = ({ transaction }: { transaction: Transaction }) => {
    if (transaction.subCategory?.id) {
      return <SubCategoryRenderer subCategory={subCategories.find(s => s.id === transaction.subCategory?.id)} />
    }
    if (transaction.transferAccount?.id) {
      return <AccountRenderer account={accounts.find(a => a.id === transaction.transferAccount?.id)} />
    }
    return <></>
  }

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
      minWidth: 150,
      width: 170,
      headerName: t('app.account'),
      field: 'raw.account',
      hide: account !== undefined,
      cellRendererSelector: params => ({
        params: { account: accounts.find(a => a.id === params.data?.raw.account.id) },
        component: AccountRenderer
      })
    },
    {
      minWidth: 170,
      width: 200,
      headerName: t('app.subCategory'),
      field: 'classification',
      editable: true,
      cellEditor: AutocompleteSelectCellEditor,
      cellEditorParams: { selectData: classificationOptions },
      valueGetter: (row) => getClassificationTitle(row.data?.classification),
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

  const deleteTransactions = async () => {
    if (!tenantId) return;
    await database(tenantId).write(async () => {
      const selectedTransactions = selectedTransactionIds
        .map(id => transactions.find(t => t.id === id))
      selectedTransactions.forEach(t => t?.markAsDeleted());
    });
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
        <div className='m-2 flex flex-row gap-2'>
          <Dropdown menu={{
            onClick: (selection) => navigate(`/transactions/${selection.key}`),
            items: [{
              icon: <Avatar size={'small'} shape='square' style={{ backgroundColor: `var(--ant-${pickRandomByHash(all, antColors)}-6)` }} >{all.charAt(0).toUpperCase()}</Avatar>,
              key: all,
              label: t('app.all')
            }, ...accounts.map(a => ({
              key: a.id,
              label: a.name,
              icon: <Avatar size={'small'} shape='square' style={{ backgroundColor: `var(--ant-${pickRandomByHash(a.name, antColors)}-6)` }} >{a.name.charAt(0).toUpperCase()}</Avatar>
            }))]
          }}>
            <div className='flex flex-row gap-2 items-center text-xl'>
              <Avatar shape='square' style={{ backgroundColor: `var(--ant-${pickRandomByHash(account?.name ?? all, antColors)}-6)` }} >
                {(account?.name ?? all).charAt(0).toUpperCase()}
              </Avatar>
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

const enhance = withObservables(['tenantId'], ({tenantId}) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(),
  subCategories: database(tenantId).collections.get<SubCategory>(TableName.SubCategories).query(),
  transactions: database(tenantId).collections.get<Transaction>(TableName.Transactions).query(Q.sortBy('transaction_at'))
}));
const EnhancedTransactionsPage = () => {
  const { tenantId } = useParams();
  return enhance(TransactionsPage)(tenantId);
}
export default EnhancedTransactionsPage;