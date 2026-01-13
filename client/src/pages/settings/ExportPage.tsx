import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import database from "../../db/database";
import Transaction from "../../db/models/Transaction";
import TableName from "../../db/TableName";

interface TransactionData {
  id: string;
  title: string;
  summary: string;
  amount: number;
  transactionAt: Date;
  accountName: string;
  transferAccountName?: string;
  subCategoryName?: string;
  categoryName?: string;
  createdAt: Date;
  modifiedAt: Date;
}

const ExportPage: React.FC = () => {
  const { tenantId } = useParams();
  const [data, setData] = useState<TransactionData[]>([]);

  useEffect(() => {
    if (!tenantId) return;

    const fetchTransactions = async () => {
      const transactions = await database(tenantId)
        .collections.get<Transaction>(TableName.Transactions)
        .query()
        .fetch();

      const mappedData = await Promise.all(
        transactions.map(async (transaction) => {
          const account = await transaction.account.fetch();
          const transferAccount = transaction.transferAccount
            ? await transaction.transferAccount.fetch()
            : undefined;
          const subCategory = transaction.subCategory
            ? await transaction.subCategory.fetch()
            : undefined;
          const category = subCategory
            ? await subCategory.category.fetch()
            : undefined;

          return {
            id: transaction.id,
            title: transaction.title,
            summary: transaction.summary,
            amount: transaction.amount,
            transactionAt: transaction.transactionAt,
            accountName: account.name,
            transferAccountName: transferAccount?.name,
            subCategoryName: subCategory?.name,
            categoryName: category?.name,
            createdAt: transaction.createdAt,
            modifiedAt: transaction.modifiedAt,
          };
        })
      );

      setData(mappedData);
    };

    fetchTransactions();
  }, [tenantId]);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Summary</th>
            <th>Amount</th>
            <th>Account</th>
            <th>Category</th>
            <th>Sub-Category</th>
            <th>Transfer Account</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id}>
              <td>{new Date(row.transactionAt).toLocaleDateString()}</td>
              <td>{row.title}</td>
              <td>{row.summary}</td>
              <td>{row.amount.toFixed(2)}</td>
              <td>{row.accountName}</td>
              <td>{row.categoryName || '-'}</td>
              <td>{row.subCategoryName || '-'}</td>
              <td>{row.transferAccountName || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && <p>No transactions found.</p>}
    </div>
  );
};

export default ExportPage;