import express, { Router } from "express";
import db from "../../services/db";

const router: Router = express.Router();

router.get('/', async (req, res) => {
    const result = await db.query('select * from Accounts');
    res.json(result.recordset);
});

export default router;