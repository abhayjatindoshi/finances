import Transaction from "../../db/models/Transaction";
import SubCategory from "../../db/models/SubCategory";
import React from "react";
import database from "../../db/database";
import Account from "../../db/models/Account";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTranslation } from "react-i18next";
import { useForceUpdate } from "../../utils/ComponentUtils";
import { ReactGrid, Column, Row, DefaultCellTypes, CellChange, OptionType, CheckboxCell } from "@silevis/reactgrid";
import { Q } from '@nozbe/watermelondb';
import { convertToTransactionRows, updateTransaction } from "../../utils/TransactionHelpers";
import { AntDropdownCellTemplate, AntDropdownCell } from "./templates/AntDropdownCellTemplate";
import "@silevis/reactgrid/styles.css";
import { dateTimeFormat } from "../../constants";

interface TransactionSheetProps {
  account: Account
  refresh?: () => void
  transactions: Array<Transaction>
  subCategories: Array<SubCategory>
  accounts: Array<Account>
  setSelectedTransactions: (selectedTransactionIds: string[]) => void
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ account, transactions, subCategories, accounts, refresh, setSelectedTransactions }) => {

  const { t } = useTranslation();
  const forceUpdate = useForceUpdate();
  const [totalWidth, setTotalWidth] = React.useState(0);
  const elementRef = React.useRef<HTMLDivElement>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    const handleResize = () => {
      if (elementRef.current) {
        const elementWidth = elementRef.current.offsetWidth;
        const elementScrollWidth = elementRef.current.scrollWidth;
        const width = elementWidth - (elementScrollWidth - elementWidth);
        setTotalWidth(width);
      }
    }

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const classificationOptions: OptionType[] = [...subCategories.map(s => ({
    value: JSON.stringify({ subCategoryId: s.id }),
    label: s.name
  })), ...accounts.map(a => ({
    value: JSON.stringify({ transferAccountId: a.id }),
    label: a.name
  }))];


  const columns: Column[] = [
    { columnId: 'selection', width: 30 },
    { columnId: 'id', width: 40 },
    { columnId: 'classification', width: 150 },
    { columnId: 'date', width: 150 },
    { columnId: 'title', width: totalWidth - 750 < 150 ? 150 : totalWidth - 750 },
    { columnId: 'withdraw', width: 100 },
    { columnId: 'deposit', width: 100 },
    { columnId: 'balance', width: 150 },
  ];

  const headerRow: Row = {
    rowId: 'header',
    height: 35,
    cells: [
      { type: 'checkbox', checked: selectedTransactionIds.length === transactions.length && transactions.length > 0 },
      { type: 'header', text: t('app.id') },
      { type: 'header', text: t('app.subCategory') },
      { type: 'header', text: t('app.time') },
      { type: 'header', text: t('app.title') },
      { type: 'header', text: t('app.withdraw') },
      { type: 'header', text: t('app.deposit') },
      { type: 'header', text: t('app.balance') },
    ]
  }

  const transactionRows = convertToTransactionRows(transactions, selectedTransactionIds, account.initialBalance);
  const rows: Row<DefaultCellTypes | AntDropdownCell>[] = transactionRows.map((transaction, index) => {
    return {
      rowId: transaction.id,
      height: 35,
      cells: [
        { type: 'checkbox', checked: transaction.selected },
        { type: 'number', value: index + 1, nonEditable: true, className: 'rg-id' },
        { type: 'classification', text: transaction.classification },
        { type: 'date', date: transaction.date, format: dateTimeFormat },
        { type: 'text', text: transaction.title },
        { type: 'number', value: transaction.withdraw, format: Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }) },
        { type: 'number', value: transaction.deposit, format: Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }) },
        { type: 'number', value: transaction.balance, format: Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }), nonEditable: true },
      ]
    }
  });

  const setTransactionSelectionStatus = (transactionId: string | undefined, selectionStatus: boolean) => {
    let selectedIds = selectedTransactionIds;
    if (!transactionId) {
      selectedIds = selectionStatus ? transactionRows.map(t => t.id) : [];
    } else {
      if (selectionStatus === true) {
        selectedIds.push(transactionId);
      } else if (selectedIds.indexOf(transactionId) >= 0) {
        selectedIds.splice(selectedIds.indexOf(transactionId), 1);
      }
    }
    setSelectedTransactionIds(selectedIds)
    setSelectedTransactions(selectedIds);
  }


  const handleChanges = async (changes: CellChange[]) => {
    for (const change of changes) {
      const transaction = transactionRows.find(transaction => transaction.id === change.rowId);

      if (change.columnId === 'selection') {
        setTransactionSelectionStatus(transaction?.id, (change.newCell as CheckboxCell).checked);
      }

      if (!transaction) return;

      await updateTransaction(transaction, change.columnId, change.newCell);
      forceUpdate();
      refresh && refresh();
    }
  }

  return (
    <div ref={elementRef} className="h-full">
      <ReactGrid
        columns={columns}
        rows={[headerRow, ...rows]}
        stickyTopRows={1}
        onCellsChanged={handleChanges}
        customCellTemplates={{
          classification: new AntDropdownCellTemplate(classificationOptions)
        }} />
    </div>
  );
};

const enhance = withObservables(['account'], ({ account }: { account: Account }) => ({
  account,
  accounts: database.collections.get<Account>('accounts').query(Q.sortBy('name', 'desc')),
  transactions: database.collections.get<Transaction>('transactions').query(Q.where('account_id', account.id), Q.sortBy('transaction_at', 'desc')),
  subCategories: database.collections.get<SubCategory>('sub_categories').query(Q.sortBy('name'))
}));
const EnhancedTransactionSheet = enhance(TransactionSheet);
export default EnhancedTransactionSheet;