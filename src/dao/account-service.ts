import BaseService, { Model } from "./base-service"

export interface Account extends Model {
    name: string
    initial_balance: number
}

export default new class AccountService extends BaseService<Account> {

    entityName: string = "accounts"

    sanitize(entity: Account): Account {
        return {
            id: entity.id,
            name: entity.name,
            initial_balance: entity.initial_balance,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
    validate(entity: Account): Account {
        return entity;
    }
}();