import Transaction from "../../db/models/Transaction";
import SubCategory from "../../db/models/SubCategory";
import React from "react";
import database from "../../db/database";
import Account from "../../db/models/Account";
import { withObservables } from "@nozbe/watermelondb/react";
import { useTranslation } from "react-i18next";
import { useForceUpdate } from "../../utils/ComponentUtils";
import { ReactGrid, Column, Row, DefaultCellTypes, CellChange } from "@silevis/reactgrid";
import { Q } from '@nozbe/watermelondb';
import { convertToTransactionRows, updateTransaction } from "../../utils/TransactionHelpers";
import { BaseOptionType } from "antd/es/select";
import { AntDropdownCellTemplate, AntDropdownCell } from "./templates/AntDropdownCellTemplate";
import "@silevis/reactgrid/styles.css";

interface TransactionSheetProps {
  account: Account
  refresh?: () => void
  transactions: Array<Transaction>
  subCategories: Array<SubCategory>
  accounts: Array<Account>
}

const TransactionSheet: React.FC<TransactionSheetProps> = ({ account, transactions, subCategories, accounts, refresh }) => {

  const { t } = useTranslation();
  const forceUpdate = useForceUpdate();
  const [totalWidth, setTotalWidth] = React.useState(0);
  const elementRef = React.useRef<HTMLDivElement>(null);

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

  const classificationOptions: BaseOptionType[] = [...subCategories.map(s => ({
    value: JSON.stringify({ subCategoryId: s.id }),
    label: s.name
  })), ...accounts.map(a => ({
    value: JSON.stringify({ transferAccountId: a.id }),
    label: a.name
  }))];

  
  const columns: Column[] = [
    { columnId: 'id', width: 40, resizable: false, },
    { columnId: 'classification', width: 150, resizable: true, },
    { columnId: 'date', width: 150, resizable: true, },
    { columnId: 'title', width: totalWidth - 750, resizable: true, },
    { columnId: 'withdraw', width: 100, resizable: true, },
    { columnId: 'deposit', width: 100, resizable: true, },
    { columnId: 'balance', width: 150, resizable: true, },
  ];

  const headerRow: Row = {
    rowId: 'header',
    height: 35,
    cells: [
      { type: 'header', text: t('app.id') },
      { type: 'header', text: t('app.subCategory') },
      { type: 'header', text: t('app.time') },
      { type: 'header', text: t('app.title') },
      { type: 'header', text: t('app.withdraw') },
      { type: 'header', text: t('app.deposit') },
      { type: 'header', text: t('app.balance') },
    ]
  }

  const transactionRows = convertToTransactionRows(transactions, account.initialBalance);
  const rows: Row<DefaultCellTypes | AntDropdownCell>[] = transactionRows.map((transaction, index) => {
    return {
      rowId: transaction.id,
      height: 35,
      cells: [
        { type: 'number', value: index + 1, nonEditable: true },
        { type: 'classification', text: transaction.classification },
        { type: 'date', date: transaction.date, format: Intl.DateTimeFormat('en-IN') },
        { type: 'text', text: transaction.title },
        { type: 'number', value: transaction.withdraw },
        { type: 'number', value: transaction.deposit },
        { type: 'number', value: transaction.balance, nonEditable: true },
      ]
    }
  });

  const handleChanges = async (changes: CellChange[]) => {
    for (const change of changes) {
      const transaction = transactionRows.find(transaction => transaction.id === change.rowId);
      if (!transaction) return;

      await updateTransaction(transaction, change.columnId, change.newCell);
      forceUpdate();
      refresh && refresh();
    }
  }

  return (
    <div ref={elementRef} className="flex flex-col items-center">
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