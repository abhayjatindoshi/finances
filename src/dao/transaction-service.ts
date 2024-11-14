import BaseService, { Model } from "./base-service"

export interface Transaction extends Model {
    account_id: number
    transfer_account_id: number
    sub_category_id: number
    transaction_at: number
    title: string
    summary: string
    amount: number
}

export default new class TransactionService extends BaseService<Transaction> {
    entityName: string = "transactions"
    sanitize(entity: Transaction): Transaction {
        return {
            id: entity.id,
            account_id: entity.account_id,
            transfer_account_id: entity.transfer_account_id,
            sub_category_id: entity.sub_category_id,
            transaction_at: entity.transaction_at,
            title: entity.title,
            summary: entity.summary,
            amount: entity.amount,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
    validate(entity: Transaction): Transaction {
        return entity;
    }
}();