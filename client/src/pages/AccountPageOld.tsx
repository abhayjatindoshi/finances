import { HomeOutlined } from '@ant-design/icons'
import { Table } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Account, AccountsApi, SubCategoriesApi, SubCategory, Transaction, TransactionsApi } from '../generated';
import PageBreadcrumb from '../layout/PageBreadcrumb';
import Column from 'antd/es/table/Column';
import moment from 'moment';

export default function AccountPage() {

  const { id } = useParams();
  const [account, setAccount] = useState<Account>();
  const [subCategories, setSubCategories] = useState<SubCategory[]>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (id) {
      new AccountsApi()
        .getAccount({ id: Number.parseInt(id) })
        .subscribe(setAccount);

      new SubCategoriesApi()
        .getSubCategories()
        .subscribe(setSubCategories);

      new TransactionsApi()
        .getTransactions({ accountId: Number.parseInt(id) })
        .subscribe(setTransactions);
    }
  }, [id])

  function Transactions() {
    return <Table<Transaction> dataSource={transactions} >
      <Column title="ID" dataIndex="id" key="id" />
      <Column title="SubCategory" dataIndex="subCategoryId" key="subCategoryId" render={(subCategoryId => subCategories?.filter(s => s.id === subCategoryId).at(0)?.name)} />
      <Column title="Timestamp" dataIndex="timestamp" key="timestamp" render={(timestamp: number) => moment.unix(timestamp / 1000).fromNow()} />
      <Column title="Title" dataIndex="title" key="title" />
      <Column title="Credit" dataIndex="amount" key="credit" render={(amount: number) => { return amount > 0 ? amount : '' }} />
      <Column title="Debit" dataIndex="amount" key="debit" render={(amount: number) => { return amount < 0 ? -amount : '' }} />
    </Table>
  }

  return (
    <div>
      <PageBreadcrumb items={[
        <Link to="/"><HomeOutlined /></Link>,
        <Link to={`/accounts/${id}`}>{account?.name}</Link>
      ]} />
      <div className='m-5'>
        <Transactions />
      </div>
    </div>
  )
}
