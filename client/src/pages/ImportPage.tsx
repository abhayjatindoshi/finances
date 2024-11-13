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
import SubCategory from '../db/models/SubCategory';

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
    let entities = [{"sub":"Electricity", "category":"Bills"},{"sub":"Gas", "category":"Bills"},{"sub":"Internet", "category":"Bills"},{"sub":"Mobile Recharge", "category":"Bills"},{"sub":"Cashback", "category":"Cashback"},{"sub":"Charity", "category":"Charity"},{"sub":"Commute", "category":"Commute"},{"sub":"Petrol", "category":"Commute"},{"sub":"Jigna HDFC", "category":"Family Contribution"},{"sub":"Gold", "category":"Gold"},{"sub":"Home Appliances", "category":"Home Appliances"},{"sub":"Grocery", "category":"Home Expenses"},{"sub":"Home Maintenance", "category":"Home Expenses"},{"sub":"Medical", "category":"Home Expenses"},{"sub":"Packers and Movers", "category":"Home Expenses"},{"sub":"SBI Home Loan", "category":"Home Loan"},{"sub":"House Rent", "category":"House Rent"},{"sub":"Bank Interest", "category":"Interest"},{"sub":"Dining", "category":"Lifestyle"},{"sub":"Gift", "category":"Lifestyle"},{"sub":"Movie", "category":"Lifestyle"},{"sub":"Outing", "category":"Lifestyle"},{"sub":"Parlour", "category":"Lifestyle"},{"sub":"Shopping", "category":"Lifestyle"},{"sub":"Abhay HDFC PPF A/C", "category":"PPF"},{"sub":"Microsoft", "category":"Salary"},{"sub":"Abhay Spends", "category":"Spends"},{"sub":"Anjali Spends", "category":"Spends"},{"sub":"Eshita ICICI A/C", "category":"Spends"},{"sub":"Eshita Spends", "category":"Spends"},{"sub":"Kanak Jewellers BOB A/C", "category":"Spends"},{"sub":"Mummy Spends", "category":"Spends"},{"sub":"Papa Spends", "category":"Spends"},{"sub":"Raj Spends", "category":"Spends"},{"sub":"Shubh Spends", "category":"Spends"},{"sub":"Shah Family Spends", "category":"Spends"},{"sub":"Vini HDFC A/C", "category":"Spends"},{"sub":"Abhay PayTM Bank A/C", "category":"Spends"},{"sub":"Sharekhan", "category":"Stocks"},{"sub":"Income Tax", "category":"Tax"},{"sub":"Property Tax", "category":"Tax"},{"sub":"Abhay Fi A/C", "category":"Transfer"},{"sub":"Abhay HDFC A/C", "category":"Transfer"},{"sub":"Abhay Jupiter A/C", "category":"Transfer"},{"sub":"Eshita Jupiter A/C", "category":"Transfer"},{"sub":"Train Tickets", "category":"Travel"}];
    let categories = await database.collections.get<Category>('categories').query().fetch();
    let subCategories = await database.collections.get<SubCategory>('sub_categories');
    await database.write(async () => {
      entities.forEach(entity => {
        let name = entity.sub;
        let category = categories.find(category => category.name === entity.category);
        if (!category) {
          console.log('Unable to find category', entity.category);
          return;
        }
        subCategories.create((subCategory) => {
          subCategory.name = name;
          subCategory.category.set(category!);
        });
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
