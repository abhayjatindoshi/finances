import AccountService from "./account-service";
import BaseService, { Model } from "./base-service";
import CategoryService from "./category-service";
import SubCategoryService from "./sub-category-service";
import TransactionService from "./transaction-service";

const services: Array<BaseService<Model>> = [
    AccountService,
    CategoryService,
    SubCategoryService,
    TransactionService,
];

export const serviceMap: Map<string, BaseService<any>> = services.reduce((map, service) => {
    map.set(service.entityName, service);
    return map;
}, new Map<string, BaseService<any>>)