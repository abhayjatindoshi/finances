import express, { Router } from "express";
import db from "../../services/db";
import { Account } from "../../generated/model/account";
import ApiError, { ApiErrorCode } from "../../api-error";

const router: Router = express.Router();

router.get('/', async (req, res) => {
    const result: Account[] = await db.fetchAll`select * from Accounts`;
    res.json(result);
});

router.get('/', async (req, res) => {
    const result = await db.fetchAll`(select accountId, sum(amount) as Total from Transactions group by accountId) as Transactions
left join (select id, name, initialBalance from Accounts) on id = accountId
`
})

router.get('/:id', async (req, res) => {
    const result = await getAccount(Number.parseInt(req.params['id']));
    res.json(result);
});

router.post('/', async (req, res) => {
    if (!req.body.name) {
        throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Name is not specified");
    }

    let rowCount = await db.execute`insert into Accounts (name) values (${req.body.name})`
    if (rowCount != 1) {
        throw ApiError.message("Failed to create account.");
    }
    res.sendStatus(201);
});

router.patch('/:id', async (req, res) => {
    if (!req.body.name) {
        throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Name is not specified");
    }

    let rowsAffected = await db.execute`update Accounts set name = ${req.body.name} where id = ${Number.parseInt(req.params.id)}`
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to update account.');
    }

    res.sendStatus(200);
})

router.delete('/:id', async (req, res) => {
    let rowsAffected = await db.execute`delete from Accounts where id = ${Number.parseInt(req.params.id)}`
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to delete account.');
    }

    res.sendStatus(200);
})

export async function getAccount(id: number): Promise<Account | undefined> {
    let account: Account | undefined = await db.fetchOne`select * from Accounts where id = ${id}`
    return account;
}

export default router;