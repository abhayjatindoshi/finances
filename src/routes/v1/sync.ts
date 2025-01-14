import express, { Router } from "express";
import { ChangeSet } from "../../dao/base-service";
import { serviceMap } from "../../dao";
import { authenticated } from "../../services/passport";

const router: Router = express.Router();

router.post('/pull', authenticated, async (req, res) => {
    let lastPulledAt = parseInt(req.query['lastPulledAt'] as string);
    let schemaVersion = req.query['schemaVersion'];
    let migration = req.query['migration'];
    let replacement = req.query['replacement'] === 'true';

    if (!lastPulledAt || isNaN(lastPulledAt) || replacement) {
        lastPulledAt = 0;
    }

    let services = Array.from(serviceMap.values());
    let changes: ChangeSet = await Promise.all(services.map(s => s.pull(lastPulledAt)))
        .then((allChanges) => allChanges.reduce((changes, change, i) => {
            let name: string = services[i].entityName
            changes[name] = change
            return changes;
        }, {} as ChangeSet))

    let response: any = {
        changes,
        timestamp: new Date().getTime()
    };

    if (replacement) {
        response['experimentalStrategy'] = 'replacement';
    }
    res.json(response);
})

router.post('/push', authenticated, async (req, res) => {
    let lastPulledAt = parseInt(req.query['lastPulledAt'] as string);
    let changes: ChangeSet = req.body;

    let result = await Promise.all(Object.entries(changes)
        .map(([entityName, change]) =>
            serviceMap.get(entityName)?.push(lastPulledAt, change)))

    res.json(result)
})

export default router;