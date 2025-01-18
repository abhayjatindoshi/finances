import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import { schema } from "./schema";
import migrations from "./migrations";
import { Database } from "@nozbe/watermelondb";
import Account from "./models/Account";
import Category from "./models/Category";
import SubCategory from "./models/SubCategory";
import Tranasction from "./models/Transaction";
import { Tenant } from "../pages/AppLoaderPage";
import { tenantsApiUrl } from "../constants";

let currentDatabase: Database | undefined;

export async function loadDatabase(): Promise<void> {
  const tenants = await fetch(tenantsApiUrl).then(res => res.json());
  if (tenants.length === 0) {
    window.location.href = '/error?error=app.noTenants';
    return;
  }
  setCurrentDatabase(tenants[0]);
}

function setCurrentDatabase(tenant: Tenant) {
  currentDatabase = new Database({
    adapter: new LokiJSAdapter({
      schema,
      migrations,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
      dbName: tenant.id
    }),
    modelClasses: [Account, Category, SubCategory, Tranasction]
  });
}

const database = (): Database => {
  if (!currentDatabase) {
    throw new Error('Database not loaded');
  }
  return currentDatabase;
}

export default database;