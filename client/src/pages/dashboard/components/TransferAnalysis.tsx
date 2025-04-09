import { ArrowDownOutlined, ArrowUpOutlined, CheckCircleOutlined, CloseCircleOutlined, RightOutlined } from '@ant-design/icons';
import { withObservables } from '@nozbe/watermelondb/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { moneyFormat } from '../../../constants';
import TableName from '../../../db/TableName';
import database from '../../../db/database';
import Account from '../../../db/models/Account';
import { default as Tranasction, default as Transaction } from '../../../db/models/Transaction';

interface TransferAnalysisProps {
  accounts: Array<Account>;
  transactions: Array<Tranasction>;
}

interface Row {
  fromAccount: Account;
  toAccount: Account;
  transactions: Array<Tranasction>;
  withdraw: number;
  deposit: number;
  total: number;
}

const TransferAnalysis: React.FC<TransferAnalysisProps> = ({ accounts, transactions }) => {

  const { t } = useTranslation();

  const rows: Array<Row> = [];
  accounts.forEach(leftAccount => {
    accounts.forEach(rightAccount => {
      if (leftAccount === rightAccount) return;
      const filteredTransactions = transactions.filter(t => t.account.id === leftAccount.id && t.transferAccount?.id === rightAccount.id);
      if (filteredTransactions.length === 0) return;

      const withdraw = filteredTransactions.filter(t => t.amount < 0).reduce((total, t) => total + t.amount, 0);
      const deposit = filteredTransactions.filter(t => t.amount > 0).reduce((total, t) => total + t.amount, 0);
      const total = withdraw + deposit;
      if (total === 0) return;

      rows.push({
        fromAccount: leftAccount,
        toAccount: rightAccount,
        transactions: filteredTransactions,
        withdraw: parseFloat(withdraw.toFixed(2)),
        deposit: parseFloat(deposit.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
      });

    });
  });

  const verify = (row: Row) => {
    const oppositeRow = getOppositeRow(row);
    if (!oppositeRow) return false;
    return oppositeRow.total + row.total === 0;
  };

  const getOppositeRow = (row: Row) => {
    const { fromAccount, toAccount } = row;
    return rows.find(r => r.fromAccount.id === toAccount.id && r.toAccount.id === fromAccount.id);
  };

  return (
    <div className='rounded-lg p-4' style={{ backgroundColor: 'var(--ant-color-bg-container)' }}>
      {rows.length === 0 ?
        <div className='text-center my-12 w-96'>
          {t('app.notEnoughData')}
        </div> :
        <table className='w-full'>
          <thead>
            <tr className='text-left'>
              <th className='text-sm'>{t('app.from')}</th>
              <th></th>
              <th className='text-sm'>{t('app.to')}</th>
              <th className='text-sm'>{t('app.amount')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.total < 0).map(row => (
              <tr key={`${row.fromAccount.id}-${row.toAccount.id}`}>
                <td>{row.fromAccount.name}</td>
                <td><RightOutlined className='mx-4' /></td>
                <td>{row.toAccount.name}</td>
                <td>
                  <div className='flex flex-row items-center gap-2 m-2'>
                    <div className='text-2xl'>{moneyFormat.format(-row.total)}</div>
                    <div className='flex flex-col'>
                      {row.deposit !== 0 && <div className='text-xs text-green-400'><ArrowDownOutlined />{moneyFormat.format(row.deposit)}</div>}
                      {row.withdraw !== 0 && <div className='text-xs text-red-400'><ArrowUpOutlined /> {moneyFormat.format(-row.withdraw)}</div>}
                    </div>
                  </div>
                </td>
                <td>{verify(row) ? <CheckCircleOutlined className='text-green-400 mx-2' /> : <CloseCircleOutlined className='text-red-400 mx-2' />}</td>
                <td>
                  {!verify(row) && getOppositeRow(row) && moneyFormat.format(-row.total - (getOppositeRow(row)?.total ?? 0))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>}
    </div>
  );
};
const enhance = withObservables(['tenantId'], ({ tenantId }) => ({
  accounts: database(tenantId).collections.get<Account>(TableName.Accounts).query(),
  transactions: database(tenantId).collections.get<Transaction>(TableName.Transactions).query(),
}));
const EnhancedTransferAnalysis = () => {
  const { tenantId } = useParams();
  const EnhancedTransferAnalysis = enhance(TransferAnalysis);
  return <EnhancedTransferAnalysis tenantId={tenantId} />;
};
export default EnhancedTransferAnalysis;