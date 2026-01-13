import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomButton from "../../common/CustomButton";
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
  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveJson = () => {
    const exportedAt = new Date().toISOString();
    const fileName = `tenant-${tenantId ?? "unknown"}-transactions-${exportedAt.replace(/[:.]/g, "-")}.json`;

    const payload = {
      tenantId: tenantId ?? null,
      exportedAt,
      count: data.length,
      transactions: data,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!tenantId) return;

    const fetchTransactions = async () => {
      setLoading(true);
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
      setLoading(false);
    };

    fetchTransactions();
  }, [tenantId]);

  const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Export & Data Overview</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Quick snapshot of your data before export.</p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading transactions…</p>
        </div>
      ) : (
        (() => {
          const accounts = Array.from(new Set(data.map((d) => d.accountName))).sort();
          const categoriesCount = new Set(data.map((d) => d.categoryName).filter(Boolean)).size;
          const subCategoriesCount = new Set(
            data.map((d) => d.subCategoryName).filter(Boolean)
          ).size;

          return (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total Transactions" value={data.length} />
                <StatCard label="Unique Accounts" value={accounts.length} />
                <StatCard label="Unique Categories" value={categoriesCount} />
                <StatCard label="Unique Sub-Categories" value={subCategoriesCount} />
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Accounts</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{accounts.length} total</span>
                  </div>
                  <div className="p-4">
                    {accounts.length === 0 ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">No accounts found.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {accounts.map((name) => (
                          <span
                            key={name}
                            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-800">
                    <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Export</h2>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Save your data locally</span>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <CustomButton
                        size="medium"
                        variant="primary"
                        onClick={handleSaveJson}
                        disabled={loading || data.length === 0}
                      >
                        Save as JSON
                      </CustomButton>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {loading ? "Preparing data…" : data.length === 0 ? "No transactions to export" : `${data.length} transactions ready`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })()
      )}
    </div>
  );
};

export default ExportPage;