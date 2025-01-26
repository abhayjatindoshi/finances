import { Database } from "@nozbe/watermelondb";
import { schema } from "./schema";
import Account from "./models/Account";
import Category from "./models/Category";
import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import migrations from "./migrations";
import SubCategory from "./models/SubCategory";
import Tranasction from "./models/Transaction";

const allModels = [Account, Category, SubCategory, Tranasction];
const dbCache = new Map<string, Database>();

const database = (tenantId: string): Database => {
  let db: Database | undefined = dbCache.get(tenantId);
  if (!db) {
    db = createNewDbInstance(tenantId);
    dbCache.set(tenantId, db);
  }
  return db;
}

export const allTenantIds = () => {
  return Array.from(dbCache.keys());
}

const createNewDbInstance = (tenantId: string): Database => {
  return new Database({
    adapter: new LokiJSAdapter({
      schema,
      migrations,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
      dbName: tenantId
    }),
    modelClasses: allModels
  });
}

export default database;