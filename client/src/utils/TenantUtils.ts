import { Tenant } from '../services/entities/Tenant';

type TenantFolder = Record<string, Tenant | Record<string, Tenant | Record<string, Tenant>>>;

export function tenantToFolders(tenants: Tenant[]): TenantFolder {
  const root: TenantFolder = {};
  tenants.forEach(tenant => {
    const keys = tenant.name.split('.');
    let currentLevel = root;
    keys.forEach((key, index) => {
      if (!currentLevel[key]) {
        currentLevel[key] = index === keys.length - 1 ? tenant : {};
      }
      currentLevel = currentLevel[key] as Record<string, Tenant | Record<string, Tenant>>;
    });
  });
  return root;
} 