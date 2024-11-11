import React, { useEffect, useState } from 'react'
import { SubCategoriesApi, SubCategory, Transaction } from '../generated';
import { Select, Table } from 'antd';
import Column from 'antd/es/table/Column';
import moment from 'moment';

const TransactionsTable: React.FC<{ transactions: Transaction[], className?: string, editMode?: boolean }> = ({ transactions, className, editMode = false }) => {

  const [subCategories, setSubCategories] = useState<SubCategory[]>();

  useEffect(() => {
    new SubCategoriesApi()
      .getSubCategories()
      .subscribe(setSubCategories);
  }, []);

  return (
    <div className={className}>
      <Table<Transaction> dataSource={transactions} >
        <Column title="ID" dataIndex="id" key="id" />
        <Column title="SubCategory" dataIndex="subCategoryId" key="subCategoryId" render={
          subCategoryId => <Select className='w-24' disabled={!editMode} showSearch optionFilterProp='label' options={subCategories?.map(s => { return { value: s.id, label: s.name } })} value={subCategoryId} />
        } />
        <Column title="Timestamp" dataIndex="timestamp" key="timestamp" render={(timestamp: number) => moment.unix(timestamp / 1000).format('DD/MM/YY')} />
        <Column title="Title" dataIndex="title" key="title" />
        <Column title="Withdraw" dataIndex="amount" key="withdraw" render={(amount: number) => { return amount < 0 ? -amount : '' }} />
        <Column title="Deposit" dataIndex="amount" key="deposit" render={(amount: number) => { return amount > 0 ? amount : '' }} />
      </Table>
    </div>
  )
}

export default TransactionsTable;