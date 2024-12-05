import { appSchema, tableSchema } from "@nozbe/watermelondb";
import TableName from "./TableName";

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: TableName.Accounts,
            columns: [
                { name: 'name', type: 'string' },
                { name: 'initial_balance', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: TableName.Categories,
            columns: [
                { name: 'name', type: 'string' },
                { name: 'monthly_limit', type: 'number' },
                { name: 'yearly_limit', type: 'number' },
                { name: 'type', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: TableName.SubCategories,
            columns: [
                { name: 'name', type: 'string' },
                { name: 'category_id', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: TableName.Transactions,
            columns: [
                { name: 'account_id', type: 'string' },
                { name: 'transfer_account_id', type: 'string', isOptional: true },
                { name: 'sub_category_id', type: 'string', isOptional: true },
                { name: 'transaction_at', type: 'number' },
                { name: 'title', type: 'string' },
                { name: 'summary', type: 'string' },
                { name: 'amount', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        })
    ]
})