import express, { Router } from "express";
import ApiError, { ApiErrorCode } from "../../api-error";
import { SubCategory } from "../../generated/model/subCategory";
import db from "../../services/db";
import { getCategory } from "./categories";

const router: Router = express.Router();

router.get("/", async (req, res) => {
    const result: SubCategory[] = await db.fetchAll`select * from SubCategories`;
    res.json(result);
})

router.patch("/:id", async (req, res) => {
    if (!req.body) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "No body given to update.");
    }

    let subCategory: SubCategory | undefined = await db.fetchOne`select * from SubCategories where id = ${req.params.id}`;
    if (subCategory == undefined) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid sub-category id given");
    }

    let requestSubCategory = req.body as SubCategory;
    if (requestSubCategory.name) { subCategory.name = requestSubCategory.name }
    if (requestSubCategory.categoryId) {
        if (requestSubCategory.categoryId != subCategory.categoryId) {
            let category = await getCategory(requestSubCategory.categoryId);
            if (category == undefined) {
                throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid category id given.");
            }
        }
        subCategory.categoryId = requestSubCategory.categoryId;
    }

    let rowCount = await db.execute`update SubCategories set name = ${subCategory.name}, categoryId = ${subCategory.categoryId} where id = ${subCategory.id}`;
    if (rowCount != 1) {
        throw ApiError.message("Failed to update subcategory.");
    }
    res.sendStatus(200);
})

router.delete("/:id", async (req, res) => {
    let rowsAffected = await db.execute`delete from SubCategories where id = ${Number.parseInt(req.params.id)}`
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to delete subcategory.');
    }

    res.sendStatus(200);
})

export async function getSubCategory(id: number): Promise<SubCategory | undefined> {
    let result: SubCategory | undefined = await db.fetchOne`select * from SubCategories where id = ${id}`;
    return result;
}

export default router;