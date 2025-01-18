import ApiError, { ApiErrorCode } from "../api-error";
import { cryptoRandomId, templateString } from "../server-utils";
import db from "../services/db";
import userService, { User } from "./user-service";

export interface Tenant {
  id: string,
  name: string,
  created_at: number,
  updated_at: number,
  users: User[],
}

export default new class TenantService {

  public async getTenants(user: User): Promise<Tenant[]> {
    return await db.fetchAll`select * from tenants 
    left join tenant_users on tenants.id = tenant_users.tenant_id 
    where tenant_users.user_id = ${user.id}`;
  }

  public async getTenant(user: User, tenantId: string): Promise<Tenant | undefined> {
    const rows = await db.fetchAny`select 
      tenants.id, tenants.name, tenants.created_at, tenants.updated_at,
      users.id as user_id, users.user_id as user_user_id, users.email as user_email, 
      users.name as user_name, users.picture as user_picture from tenants
      left join tenant_users on tenants.id = tenant_users.tenant_id
      left join users on tenant_users.user_id = users.id
      where tenants.id = ${tenantId}`;

    if (rows.length === 0) {
      return undefined;
    }

    const tenant: Tenant = {
      id: rows[0].id,
      name: rows[0].name,
      created_at: rows[0].created_at,
      updated_at: rows[0].updated_at,
      users: rows.map(row => ({
        id: row.user_id,
        user_id: row.user_user_id,
        email: row.user_email,
        name: row.user_name,
        picture: row.user_picture,
      }))
    };

    if (tenant.users.filter(u => u.id === user.id).length === 0) {
      return undefined;
    }

    return tenant;
  }

  public async createTenant(user: User, name: string): Promise<Tenant> {
    const tenant = {
      id: cryptoRandomId(),
      name,
      created_at: Date.now(),
      updated_at: 0,
      users: [user],
    }

    const tenantRows = await db.execute`insert into tenants values (
        ${tenant.id}, ${tenant.name}, ${tenant.created_at}, ${tenant.updated_at}
    )`;
    if (tenantRows != 1) {
      throw new Error('Failed to insert row.');
    }

    const tenantUserRows = await db.execute`insert into tenant_users values (
        ${tenant.id}, ${user.id}
    )`;
    if (tenantUserRows != 1) {
      throw new Error('Failed to insert row.');
    }

    return tenant;
  }

  public async updateTenant(user: User, id: string, name: string): Promise<void> {
    const tenant = await this.getTenant(user, id);
    if (tenant === undefined) {
      throw new Error('Tenant not found.');
    }

    const tenantRows = await db.execute`update tenants set name = ${name}, updated_at = ${Date.now()} where id = ${tenant.id}`;
    if (tenantRows != 1) {
      throw new Error('Failed to update row.');
    }
  }

  public async updateTenantUsers(user: User, id: string, emails: string[]): Promise<Array<User>> {
    const tenant = await this.getTenant(user, id);
    if (tenant === undefined) {
      throw new ApiError(400, ApiErrorCode.INVALID_DATA, 'Tenant not found.');
    }

    if (emails.length === 0) {
      throw new ApiError(400, ApiErrorCode.INVALID_DATA, 'No users specified.');
    }

    if (!emails.includes(user.email)) {
      throw new ApiError(400, ApiErrorCode.INVALID_DATA, 'You must be part of the tenant.');
    }

    const users = [];
    for (const email of emails) {
      const dbUser = await userService.createUserByEmailIfNotExists(email);
      users.push(dbUser);
    }

    const updateRow = await db.execute`update tenants set updated_at = ${Date.now()} where id = ${tenant.id}`;
    if (updateRow != 1) {
      throw new Error('Failed to update row.');
    }

    const query = [
      'delete from tenant_users where tenant_id = ',
      '; insert into tenant_users (tenant_id, user_id) values (',
      ...Array(users.length - 1).fill('), ('),
      ')'
    ];
    const vars = [tenant.id, users.map(u => [tenant.id, u.id])].flat();

    const rows = await db.execute(templateString(query), ...vars);
    if (rows == 0) {
      throw new Error('Failed to update row.');
    }

    return users;
  }
}