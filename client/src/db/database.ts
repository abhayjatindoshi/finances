import LokiJSAdapter from "@nozbe/watermelondb/adapters/lokijs";
import { schema } from "./schema";
import migrations from "./migrations";
import { Database } from "@nozbe/watermelondb";
import Account from "./models/Account";
import Category from "./models/Category";
import SubCategory from "./models/SubCategory";
import Tranasction from "./models/Transaction";

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  useWebWorker: false,
  useIncrementalIndexedDB: true,
});

const database = new Database({
  adapter,
  modelClasses: [Account, Category, SubCategory, Tranasction]
});

export default database;