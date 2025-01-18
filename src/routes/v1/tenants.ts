import express, { Router } from "express";
import { authenticated } from "../../services/passport";
import tenantService, { Tenant } from "../../dao/tenant-service";
import { User } from "../../dao/user-service";
import ApiError, { ApiErrorCode } from "../../api-error";

const router: Router = express.Router();

router.get('', authenticated, async (req, res) => {
  const user = req.user as User;
  const tenants = await tenantService.getTenants(user);
  res.json(tenants);
});

router.get('/:id', authenticated, async (req, res) => {
  const user = req.user as User;
  const tenant = await tenantService.getTenant(user, req.params.id);
  res.json(tenant);
});

router.post('', authenticated, async (req, res) => {
  const user = req.user as User;
  const tenant = req.body as Tenant;
  if (tenant.name === undefined || tenant.name === '') {
    new ApiError(400, ApiErrorCode.INVALID_DATA, "Tenant name is required").respond(res);
    return;
  }

  const resJson = await tenantService.createTenant(user, tenant.name);
  res.json(resJson);
});

router.put('/:id', authenticated, async (req, res) => {
  const user = req.user as User;
  const tenant = req.body as Tenant;
  if (tenant.name === undefined || tenant.name === '') {
    new ApiError(400, ApiErrorCode.INVALID_DATA, "Tenant name is required").respond(res);
    return;
  }

  const resJson = await tenantService.updateTenant(user, req.params.id, tenant.name);
  res.json(resJson);
});

router.put('/:id/users', authenticated, async (req, res) => {
  const user = req.user as User;
  const users = req.body as Array<User>;
  if (users.length <= 0) {
    new ApiError(400, ApiErrorCode.INVALID_DATA, "At least one user is required.").respond(res);
    return;
  }

  users.forEach(u => {
    if (u.email === undefined || u.email === '') {
      new ApiError(400, ApiErrorCode.INVALID_DATA, "Email is required.").respond(res);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(u.email)) {
      new ApiError(400, ApiErrorCode.INVALID_DATA, "Invalid email.").respond(res);
      return;
    }
  });

  const resJson = await tenantService.updateTenantUsers(user, req.params.id, users.map(u => u.email));
  res.json(resJson);
});

export default router;