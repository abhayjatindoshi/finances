import { InboxOutlined } from '@ant-design/icons';
import { Button, Upload, UploadProps } from 'antd'
import { ImportFormat, importStatementFromExcel } from '../utils/FileUtils';
import { useState } from 'react';
import database from '../db/database';
import Transaction from '../db/models/Transaction';
import Tranasction from '../db/models/Transaction';
import Account from '../db/models/Account';
import { sync } from '../db/sync';
import Category, { CategoryType } from '../db/models/Category';

const { Dragger } = Upload;

export default function ImportPage() {

  const [transactions, setTransactions] = useState<Transaction[]>()

  const props: UploadProps = {
    multiple: false,
    async beforeUpload(file, fileList) {
      let transactions = await importStatementFromExcel(ImportFormat.JUPITER, file);
      setTransactions(transactions);
      await database.write(async () => {
        let account = await database.collections.get<Account>('accounts').find('a1');
        let transactionCollection = database.collections.get<Tranasction>('transactions');
        for (let transaction of transactions) {
          await transactionCollection.create((newTransaction) => {
            newTransaction.account.set(account);
            newTransaction.transactionAt = transaction.transactionAt;
            newTransaction.title = transaction.title;
            newTransaction.summary = transaction.summary;
            newTransaction.amount = transaction.amount;
          });
        }
      });
      await sync();
      return false;
    },
    maxCount: 1
  }

  async function doSomething() {
    let entities = [{ "name": "Bills", "type": "Needs", "monthly_limit": 0, "yearly_limit": 40000 }, { "name": "Cashback", "type": "Income", "monthly_limit": 0, "yearly_limit": 0 }, { "name": "Charity", "type": "Wants", "monthly_limit": 0, "yearly_limit": 10000 }, { "name": "Commute", "type": "Needs", "monthly_limit": 3000, "yearly_limit": 0 }, { "name": "Family Contribution", "type": "Needs", "monthly_limit": 15000, "yearly_limit": 0 }, { "name": "Gold", "type": "Savings", "monthly_limit": 0, "yearly_limit": 200000 }, { "name": "Home Appliances", "type": "Wants", "monthly_limit": 0, "yearly_limit": 100000 }, { "name": "Home Expenses", "type": "Needs", "monthly_limit": 10000, "yearly_limit": 0 }, { "name": "Home Loan", "type": "Needs", "monthly_limit": 125000, "yearly_limit": 0 }, { "name": "House Rent", "type": "Needs", "monthly_limit": 30000, "yearly_limit": 0 }, { "name": "Interest", "type": "Income", "monthly_limit": 0, "yearly_limit": 0 }, { "name": "Lifestyle", "type": "Wants", "monthly_limit": 10000, "yearly_limit": 0 }, { "name": "PPF", "type": "Savings", "monthly_limit": 5000, "yearly_limit": 0 }, { "name": "Salary", "type": "Income", "monthly_limit": 0, "yearly_limit": 0 }, { "name": "Spends", "type": "Needs", "monthly_limit": 0, "yearly_limit": 0 }, { "name": "Stocks", "type": "Savings", "monthly_limit": 0, "yearly_limit": 240000 }, { "name": "Tax", "type": "Needs", "monthly_limit": 0, "yearly_limit": 300000 }, { "name": "Travel", "type": "Wants", "monthly_limit": 0, "yearly_limit": 100000 }];
    let categories = database.collections.get<Category>('categories');
    await database.write(async () => {
      entities.forEach(entity => {
        categories.create((newCategory) => {
          newCategory.name = entity.name;
          newCategory.type = entity.type as CategoryType;
          newCategory.monthlyLimit = entity.monthly_limit;
          newCategory.yearlyLimit = entity.yearly_limit;
        })
      });
    });
    await sync();
  }

  return <>
    <div>ImportPage</div>
    {!transactions ?
      <Dragger {...props} className="block m-10 w-64">
        <p className='ant-upload-drag-icon'>
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">
          Support for a single or bulk upload. Strictly prohibited from uploading company data or other
          banned files.
        </p>
      </Dragger>
      :
      null
      // <TransactionsTable editMode={true} transactions={transactions} />
    }
    <Button onClick={doSomething}>Do something</Button>
  </>
}
