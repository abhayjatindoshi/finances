import React from 'react';
import Account from '../../db/models/Account';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import { Database, Q } from '@nozbe/watermelondb';
import Transaction from '../../db/models/Transaction';
import { AutoComplete, Table } from 'antd';
import Column from 'antd/es/table/Column';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import Money from '../../common/Money';
import SubCategory from '../../db/models/SubCategory';
import database from '../../db/database';

interface TransactionsListProps {
  account: Account,
  transactions: Array<Transaction>,
  subCategories: Array<SubCategory>
}

class EntendedTransaction extends Transaction {
  index = 0;
  balance = 0;
}

const TransactionsList: React.FC<TransactionsListProps> = ({ account, transactions, subCategories }) => {

  const { t } = useTranslation();
  const [subCategoryOptions, setSubCategoryOptions] = React.useState<{ key: string, value: string }[]>(subCategoriesToOptions(subCategories));

  let prevBalance = account.initialBalance;
  for (let i = transactions.length - 1; i >= 0; i--) {
    const transaction = transactions[i] as EntendedTransaction;
    transaction.index = i + 1;
    transaction.balance = prevBalance + transaction.amount;
    prevBalance = transaction.balance;
  }

  function updateSubCategory(transaction: Transaction, subCategoryId: string) {
    const subCategory = subCategories.find(subCategory => subCategory.id === subCategoryId);
    if (!subCategory) return;
    database.write(async () => {
      transaction.update(t => {
        t.subCategory?.set(subCategory);
      })
    })
  }

  function subCategoryName(id: string | undefined): string {
    const subCategory = subCategories.find(subCategory => subCategory.id === id);
    return subCategory?.name || '';
  }

  function subCategoriesToOptions(subCategories: Array<SubCategory>): Array<{ key: string, value: string }> {
    return subCategories.map(subCategory => ({ key: subCategory.id, value: subCategory.name }));
  }

  function updateOptions(value: string) {
    const filtered = subCategories.filter(subCategory => subCategory.name.toLowerCase().includes(value.toLowerCase()));
    setSubCategoryOptions(subCategoriesToOptions(filtered));
  }

  return (
    <div>
      <Table<Transaction> dataSource={transactions} pagination={false} rowKey='id' size='small'>
        <Column title={t('app.id')} dataIndex="index" key="index" />
        <Column title={t('app.subCategory')} dataIndex="subCategory" key="subCategoryId" render={(subCategory: SubCategory | undefined, transaction: Transaction) => <>
          <AutoComplete className='w-48' defaultValue={subCategoryName(subCategory?.id)}
            options={subCategoryOptions}
            onSearch={value => updateOptions(value)}
            onSelect={(_, { key }: { key: string }) => updateSubCategory(transaction, key)}
            onBlur={() => updateOptions('')} />
        </>} />
        <Column title={t('app.time')} dataIndex="transactionAt" key="transactionAt" render={(transactionAt: Date) => moment(transactionAt).fromNow()} />
        <Column title={t('app.title')} dataIndex="title" key="title" />
        <Column title={t('app.withdraw')} dataIndex="amount" key="withdraw" className='text-right' render={(amount: number) => amount < 0 ? <Money amount={-amount} /> : ''} />
        <Column title={t('app.deposit')} dataIndex="amount" key="deposit" className='text-right' render={(amount: number) => { return amount > 0 ? <Money amount={(amount)} /> : '' }} />
        <Column title={t('app.balance')} dataIndex="balance" key="balance" className='text-right' render={(balance: number) => <Money amount={balance} />} />
      </Table>
    </div>
  );
};

const enhance = withObservables(['account'], ({ database, account }: { database: Database, account: Account }) => ({
  account,
  transactions: database.collections.get<Transaction>('transactions').query(Q.where('account_id', account.id), Q.sortBy('transaction_at', 'desc')),
  subCategories: database.collections.get<SubCategory>('sub_categories').query(Q.sortBy('name'))
}));
const EnhancedTransactionsList = withDatabase(enhance(TransactionsList));
export default EnhancedTransactionsList;