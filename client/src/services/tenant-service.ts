import { tenantsApiUrl } from "../constants";
import { Tenant } from "./entities/Tenant";

class TenantService {

  public async fetchAllTenants(): Promise<Array<Tenant>> {
    return await fetch(tenantsApiUrl).then(res => res.json());
  }

  public async fetchTenant(tenantId: string): Promise<Tenant> {
    return await fetch(`${tenantsApiUrl}/${tenantId}`).then(res => res.json());
  }

  public async createTenant(name: string): Promise<Tenant> {
    return await fetch(tenantsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    }).then(res => res.json());
  }

  public async updateTenantName(tenantId: string, name: string): Promise<Tenant> {
    await fetch(`${tenantsApiUrl}/${tenantId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name })
    });
    return await this.fetchTenant(tenantId);
  }

  public async updateTenantUsers(tenantId: string, userEmails: Array<string>): Promise<Tenant> {
    await fetch(`${tenantsApiUrl}/${tenantId}/users`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userEmails.map(email => ({ email })))
    });
    return await this.fetchTenant(tenantId);
  }

}

const tenantService = new TenantService();
export default tenantService;