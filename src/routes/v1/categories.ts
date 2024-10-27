import express, { Router } from "express";
import db from "../../services/db";
import ApiError, { ApiErrorCode } from "../../api-error";
import { Category } from "../../generated/model/category";
import { CategoryType } from "../../generated/model/categoryType";
import { SubCategory } from "../../generated/model/subCategory";

const router: Router = express.Router();

router.get('/', async (req, res) => {
    const result: Category[] = await db.fetchAll`select * from Categories`;
    res.json(result);
});

router.get('/:id', async (req, res) => {
    const result = await getCategory(Number.parseInt(req.params.id));
    if (result !== undefined) {
        const subCategories: SubCategory[] = await db.fetchAll`select * from SubCategories where CategoryId = ${req.params.id}`
        result.subCategories = subCategories;
    }
    res.json(result);
});

router.post('/', async (req, res) => {
    if (!req.body) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "No body provided");
    }
    let category = req.body as Category
    if (!category.name) throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Name not specified.");
    if (!category.type || !CategoryType[category.type]) throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Type not specified or invalid.");
    if (!category.monthlyLimit && !category.yearlyLimit) {
        throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Either monthly or yearly limit is mandatory.");
    }

    let rowCount = await db.execute
        `insert into categories (name, type, monthlyLimit, yearlyLimit) 
        values (${category.name}, ${category.type}, ${category.monthlyLimit}, ${category.yearlyLimit})`
    if (rowCount != 1) {
        throw ApiError.message("Failed to create category.");
    }
    res.sendStatus(201);
});

router.patch('/:id', async (req, res) => {
    if (!req.body) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "No body provided");
    }
    let requestCategory = req.body as Category
    const category = await getCategory(Number.parseInt(req.params.id));
    if (category == undefined) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid id specified");
    }

    if (requestCategory.name) { category.name = requestCategory.name }
    if (requestCategory.type && CategoryType[requestCategory.type]) { category.type = requestCategory.type }
    if (requestCategory.monthlyLimit !== undefined) { category.monthlyLimit = requestCategory.monthlyLimit }
    if (requestCategory.yearlyLimit !== undefined) { category.yearlyLimit = requestCategory.yearlyLimit }

    let rowCount = await db.execute
        `update categories set name = ${category.name}, 
        type = ${category.type}, 
        monthlyLimit = ${category.monthlyLimit},
        yearlyLimit = ${category.yearlyLimit} 
        where id = ${category.id}`;
    if (rowCount != 1) {
        throw ApiError.message("Failed to update category.");
    }
    res.sendStatus(200);
})

router.delete('/:id', async (req, res) => {
    let rowsAffected = await db.execute`delete from Categories where id = ${Number.parseInt(req.params.id)}`
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to delete category.');
    }

    res.sendStatus(200);
})

/**
 * operations for subcategories
 * POST /id/subcategories - add subcategory to a category (create new)
 * DELETE /subcategories/id - delete subcategory
 * PATCH /subcategories/id - update sub category name
 * PATCH /subcategories/id - update parent category
 */
router.post('/:id/subcategories', async (req, res) => {
    if (!req.body?.name) {
        throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Name not specified");
    }
    let categoryId = Number.parseInt(req.params.id);
    let category = await getCategory(categoryId);
    if (category === undefined) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Category id is invalid");
    }
    let subCategory: SubCategory = {
        name: req.body.name,
        categoryId: category.id
    }
    let rowCount = await db.execute`insert into SubCategories (name, categoryId) values (${subCategory.name}, ${subCategory.categoryId})`;
    if (rowCount != 1) {
        throw ApiError.message("Failed to create subcategory.");
    }
    res.sendStatus(201);
})


export async function getCategory(id: number): Promise<Category | undefined> {
    const category: Category | undefined =
        await db.fetchOne`select * from Categories where id = ${id}`
    return category;
}


export default router;