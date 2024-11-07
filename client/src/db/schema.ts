import { appSchema, tableSchema } from "@nozbe/watermelondb";

export const schema = appSchema({
    version: 1,
    tables: [
        tableSchema({
            name: 'accounts',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'initial_balance', type: 'number' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'categories',
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
            name: 'sub_categories',
            columns: [
                { name: 'name', type: 'string' },
                { name: 'category_id', type: 'string' },
                { name: 'created_at', type: 'number' },
                { name: 'updated_at', type: 'number' },
            ]
        }),
        tableSchema({
            name: 'transactions',
            columns: [
                { name: 'account_id', type: 'string' },
                { name: 'sub_category_id', type: 'string', isOptional: true },
                { name: 'transfer_account_id', type: 'string', isOptional: true },
                { name: 'transaction_at', type: 'number' },
                { name: 'title', type: 'string' },
                { name: 'summary', type: 'string' },
                { name: 'amount', type: 'number' }
            ]
        })
    ]
})