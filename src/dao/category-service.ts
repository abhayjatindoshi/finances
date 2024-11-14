import BaseService, { Model } from "./base-service"

export interface Category extends Model {
    name: string
    monthly_limit: number
    yearly_limit: number
    type: string
}

export default new class CategoryService extends BaseService<Category> {
    entityName: string = "categories"
    sanitize(entity: Category): Category {
        return {
            id: entity.id,
            name: entity.name,
            monthly_limit: entity.monthly_limit,
            yearly_limit: entity.yearly_limit,
            type: entity.type,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
        }
    }
    validate(entity: Category): Category {
        return entity;
    }
}();