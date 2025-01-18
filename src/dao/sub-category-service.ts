import BaseService, { Model } from "./base-service"

export interface SubCategory extends Model {
    name: string
    category_id: number
}

export default new class SubCategoryService extends BaseService<SubCategory> {
    entityName: string = "sub_categories"
    sanitize(entity: SubCategory): SubCategory {
        return {
            id: entity.id,
            name: entity.name,
            category_id: entity.category_id,
            created_at: entity.created_at,
            updated_at: entity.updated_at,
            tenant_id: entity.tenant_id,
        }
    }
    validate(entity: SubCategory): SubCategory {
        return entity;
    }
}()