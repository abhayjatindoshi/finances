import express, { Router } from "express";
import db from "../../services/db";

interface Change<T> {
    created: Array<T>
    updated: Array<T>
    deleted: Array<string>
}

const router: Router = express.Router();

router.post('/pull', async (req, res) => {
    let lastPulledAt = parseInt(req.query['lastPulledAt'] as string);
    let schemaVersion = req.query['schemaVersion'];
    let migration = req.query['migration'];

    if (!lastPulledAt || isNaN(lastPulledAt)) {
        lastPulledAt = 0;
    }

    let entities = ['accounts', 'categories', 'sub_categories', 'transactions'];
    let changes: any = {};
    for (let i in entities) {
        let entity = entities[i];
        changes[entity] = await pull(entity, lastPulledAt);
    }

    let response = {
        changes,
        timestamp: new Date().getTime()
    };

    res.json(response);
})

router.post('/push', async (req, res) => {

})

async function pull<T>(entityName: string, lastPulledAt: number): Promise<Change<T>> {
    const created = await db.fetchAny(templateString(['select * from ' + entityName + ' where created_at >= ', '']), lastPulledAt);
    const updated = await db.fetchAny(templateString(['select * from ' + entityName + ' where updated_at >= ', '']), lastPulledAt);
    const deleted = await db.fetchAny`select * from deleted_entities where convert(varchar,entity_type) = ${entityName} and deleted_at >= ${lastPulledAt}`;
    return {
        created,
        updated,
        deleted: deleted.map(row => row['entity_id'])
    }
}

function templateString(template: string[]): TemplateStringsArray {
    const templateStringsArray: any = template as readonly string[];
    templateStringsArray.raw = templateStringsArray;
    return templateStringsArray;
}

export default router;