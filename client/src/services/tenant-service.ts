import { tenantsApiUrl } from "../constants";
import { Tenant } from "./entities/Tenant";

class TenantService {

  public async fetchAllTenants(): Promise<Array<Tenant>> {
    return await fetch(tenantsApiUrl).then(res => res.json());
  }

}

const tenantService = new TenantService();
export default tenantService;