import express, { Router } from "express";
import { Transaction } from "../../generated/model/transaction";
import db from "../../services/db";
import ApiError, { ApiErrorCode } from "../../api-error";
import { getAccount } from "./accounts";
import { getCategory } from "./categories";
import { Account, Category, SubCategory } from "../../generated/model/models";
import { getSubCategory } from "./subcategories";

const router: Router = express.Router();

router.get('/', async (req, res) => {
    let template = ["select top 100 * from Transactions"];
    let interpolations = [];
    if (req.query.accountId) {
        template.push(template.pop() + " where accountId = ")
        interpolations.push(Number.parseInt(req.query.accountId as string));
        template.push("")
    }

    const templateQuery: any = template as readonly string[];
    templateQuery.raw = templateQuery
    const result: Transaction[] = await db.fetchAll(templateQuery, ...interpolations)
    res.json(result);
})

router.get('/:id', async (req, res) => {
    const result = await getTransaction(Number.parseInt(req.params.id));
    res.json(result);
})

router.post('/', async (req, res) => {
    if (!req.body) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "No body provided");
    }
    let transaction = req.body as Transaction;
    if (!transaction.accountId) { throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "accountId not specified") }
    if (!transaction.subCategoryId && !transaction.transferAccountId) { throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "subCategoryId and transferAccountId not specified") }
    if (!transaction.timestamp) { throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "timestamp not specified.") }
    if (!transaction.title) { throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "title not specified") }
    if (!transaction.amount) { throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "amount not specified") }

    if (transaction.subCategoryId && transaction.transferAccountId) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Cannot specify both subCategoryId and transferAccountId") }

    if (transaction.amount == 0) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Amount cannot be 0 for a transaction.");
    }

    let account = await getAccount(transaction.accountId);
    if (account === undefined) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid account id specified") }

    let category: SubCategory | undefined;
    if (transaction.subCategoryId) {
        category = await getSubCategory(transaction.subCategoryId);
        if (category == undefined) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid category id specified") }
    }

    let transferAccount: Account | undefined;
    if (transaction.transferAccountId) {
        transferAccount = await getAccount(transaction.transferAccountId);
        if (transferAccount == undefined) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid transfer account id specified.") }
    }



    let rowCount = await db.execute`insert into Transactions 
        (accountId, subCategoryId, transferAccountId,
        timestamp, title, narration, amount) values
        (${transaction.accountId}, ${transaction.subCategoryId}, ${transaction.transferAccountId},
        ${transaction.timestamp}, ${transaction.title}, ${transaction.narration}, ${transaction.amount})`
    if (rowCount != 1) {
        throw ApiError.message("Failed to create transaction.");
    }
    res.sendStatus(201);
});

router.patch("/:id", async (req, res) => {
    if (!req.body) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "No body provided");
    }

    let requestTransaction = req.body as Transaction;

    const transaction = await getTransaction(Number.parseInt(req.params.id));
    if (transaction == undefined) {
        throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid transaction id specified");
    }

    if (requestTransaction.title) { transaction.title = requestTransaction.title }
    if (requestTransaction.narration) { transaction.narration = requestTransaction.narration }
    if (requestTransaction.amount) { transaction.amount = requestTransaction.amount }
    if (transaction.amount == 0) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Amount cannot be set to 0 for a transaction.") }
    if (requestTransaction.timestamp) { transaction.timestamp = requestTransaction.timestamp }

    if (requestTransaction.accountId) {
        if (requestTransaction.accountId != transaction.accountId) {
            let account = await getAccount(requestTransaction.accountId);
            if (account == undefined) {
                throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid account id specified.");
            }
            transaction.accountId = requestTransaction.accountId;
        }
    }

    if (requestTransaction.subCategoryId !== undefined) {
        if (requestTransaction.subCategoryId != null && requestTransaction.subCategoryId != transaction.subCategoryId) {
            let subCategory = await getSubCategory(requestTransaction.subCategoryId);
            if (subCategory == undefined) {
                throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid subCategory id specified.");
            }
        }
        transaction.subCategoryId = requestTransaction.subCategoryId;
    }

    if (requestTransaction.transferAccountId !== undefined) {
        if (requestTransaction.transferAccountId != null && requestTransaction.transferAccountId != transaction.transferAccountId) {
            let transferAccount = await getAccount(requestTransaction.transferAccountId);
            if (transferAccount == undefined) {
                throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid transfer account id specified.");
            }
        }
        transaction.transferAccountId = requestTransaction.transferAccountId;
    }

    if (transaction.subCategoryId && transaction.transferAccountId) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "Cannot set both subCategoryId and transferAccountId") }
    if (!transaction.subCategoryId && !transaction.transferAccountId) { throw new ApiError(400, ApiErrorCode.INVALID_DATA, "subCategoryId and transferAccountId cannot be null") }

    let rowCount = await db.execute`update Transactions set
        accountId = ${transaction.accountId},
        subCategoryId = ${transaction.subCategoryId},
        transferAccountId = ${transaction.transferAccountId},
        title = ${transaction.title},
        narration = ${transaction.narration},
        amount = ${transaction.amount},
        timestamp = ${transaction.timestamp}
        where id = ${transaction.id}`
    if (rowCount != 1) {
        throw ApiError.message("Failed to update transaction.");
    }
    res.sendStatus(200);
})

router.delete('/:id', async (req, res) => {
    let rowsAffected = await db.execute`delete from Transactions where id = ${Number.parseInt(req.params.id)}`
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to delete transaction.');
    }

    res.sendStatus(200);
})

export async function getTransaction(id: number): Promise<Transaction | undefined> {
    let transaction: Transaction | undefined = await db.fetchOne`select * from Transactions where id = ${id}`;
    return transaction;
}

export default router;