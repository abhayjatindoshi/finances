import express, { Router } from "express";
import db from "../../services/db";
import { Account } from "../../generated/model/account";
import ApiError, { ApiErrorCode } from "../../api-error";

const router: Router = express.Router();

router.get('/', async (req, res) => {
    const result = await getAccounts();
    res.json(result);
});

router.get('/balances', async (req, res) => {
    const accounts = await getAccounts();
    const balances: Map<number, number> = accounts.reduce((map: Map<number, number>, account: Account) => {
        if (!account.id || account.initialBalance === undefined) return map;
        map.set(account.id, account.initialBalance);
        return map;
    }, new Map<number, number>());
    const result = await db.fetchAny`select  accountId, sum(amount) as total from Transactions group by accountId`;
    result.forEach(row => {
        if (balances.has(row.accountId)) {
            let totalBalance = balances.get(row.accountId) ?? 0;
            totalBalance += row.total;
            balances.set(row.accountId, totalBalance)
        }
    })
    res.json(Object.fromEntries(balances));
})

router.get('/:id', async (req, res) => {
    const result = await getAccount(Number.parseInt(req.params['id']));
    res.json(result);
});

router.post('/', async (req, res) => {
    if (!req.body.name) {
        throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Name is not specified");
    }

    let rowCount = await db.execute`insert into Accounts(name) values(${req.body.name})`
    if (rowCount != 1) {
        throw ApiError.message("Failed to create account.");
    }
    res.sendStatus(201);
});

router.patch('/:id', async (req, res) => {
    if (!req.body.name) {
        throw new ApiError(400, ApiErrorCode.FIELD_MISSING, "Name is not specified");
    }

    let rowsAffected = await db.execute`update Accounts set name = ${req.body.name} where id = ${Number.parseInt(req.params.id)} `
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to update account.');
    }

    res.sendStatus(200);
})

router.delete('/:id', async (req, res) => {
    let rowsAffected = await db.execute`delete from Accounts where id = ${Number.parseInt(req.params.id)} `
    if (rowsAffected != 1) {
        throw ApiError.message('Failed to delete account.');
    }

    res.sendStatus(200);
})

export async function getAccount(id: number): Promise<Account | undefined> {
    let account: Account | undefined = await db.fetchOne`select * from Accounts where id = ${id} `
    return account;
}

export async function getAccounts(): Promise<Account[]> {
    let accounts: Account[] = await db.fetchAll`select * from Accounts`
    return accounts;
}

export default router;