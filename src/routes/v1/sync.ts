import express, { Router } from "express";
import { ChangeSet } from "../../dao/base-service";
import { serviceMap } from "../../dao";
import { authenticated } from "../../services/passport";
import { User } from "../../dao/user-service";
import tenantService from "../../dao/tenant-service";
import ApiError, { ApiErrorCode } from "../../api-error";

const router: Router = express.Router();

router.post('/pull', authenticated, async (req, res) => {
    const user = req.user as User;
    
    const tenantId = req.header('tenant-id');
    if (!tenantId) {
        new ApiError(400, ApiErrorCode.INVALID_DATA, 'Tenant ID is required').respond(res);
        return;
    }

    const tenant = await tenantService.getTenant(user, tenantId);
    if (!tenant) {
        new ApiError(404, ApiErrorCode.INVALID_DATA, 'Tenant not found').respond(res);
        return;
    }

    let lastPulledAt = parseInt(req.query['lastPulledAt'] as string);
    let schemaVersion = req.query['schemaVersion'];
    let migration = req.query['migration'];
    let replacement = req.query['replacement'] === 'true';

    if (!lastPulledAt || isNaN(lastPulledAt) || replacement) {
        lastPulledAt = 0;
    }

    let services = Array.from(serviceMap.values());
    let changes: ChangeSet = await Promise.all(services.map(s => s.pull(tenantId, lastPulledAt)))
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
    const user = req.user as User;
    const tenantId = req.header('tenant-id');
    if (!tenantId) {
        new ApiError(400, ApiErrorCode.INVALID_DATA, 'Tenant ID is required').respond(res);
        return;
    }

    const tenant = await tenantService.getTenant(user, tenantId);
    if (!tenant) {
        new ApiError(404, ApiErrorCode.INVALID_DATA, 'Tenant not found').respond(res);
        return;
    }

    let lastPulledAt = parseInt(req.query['lastPulledAt'] as string);
    let changes: ChangeSet = req.body;

    let result = await Promise.all(Object.entries(changes)
        .map(([entityName, change]) =>
            serviceMap.get(entityName)?.push(tenantId, lastPulledAt, change)))

    res.json(result)
})

export default router;