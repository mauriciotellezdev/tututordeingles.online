import {
  MongoClient,
  Db,
  Collection,
  Document,
  MongoServerError,
} from "mongodb";

declare global {
  var _mongo: { client: MongoClient; db: Db } | undefined;
}

const getUri = () => {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGODB_URI_DEV ||
    process.env.MONGODB_URI_PROD
  );
};

const getDbName = () => process.env.MONGODB_DB || "tututordeingles";

async function connectToDatabase() {
  const uri = getUri();
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Set MONGODB_URI_DEV and MONGODB_URI_PROD (or MONGODB_URI) in your environment. Do not commit credentials."
    );
  }
  if (global._mongo && global._mongo.client) {
    return global._mongo;
  }
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });
  await client.connect();
  const db = client.db(getDbName());
  global._mongo = { client, db };
  return global._mongo;
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export async function getClient(): Promise<MongoClient> {
  const { client } = await connectToDatabase();
  return client;
}

function logValidationError(error: unknown): never {
  if (error instanceof MongoServerError && error.code === 121) {
    const info = JSON.stringify(error.errInfo, null, 2);
    const response = JSON.stringify(error.errorResponse, null, 2);
    error.message = `Document failed validation\nerrInfo: ${info}\nerrorResponse: ${response}`;
  }
  throw error;
}

type AnyFn = (...args: unknown[]) => unknown;

function wrapCollection<T extends Document>(col: Collection<T>): Collection<T> {
  return new Proxy(col, {
    get(target, prop) {
      const original = target[prop as keyof Collection<T>];
      if (typeof original !== "function") return original;

      if (prop === "find" || prop === "aggregate") {
        return function (this: Collection<T>, ...args: unknown[]) {
          return (original as AnyFn).apply(this, args);
        };
      }

      return async (...args: unknown[]) => {
        try {
          return await (original as AnyFn).apply(target, args);
        } catch (error) {
          logValidationError(error);
        }
      };
    },
  });
}

export async function getCollection<T extends Document = Document>(
  name: string
): Promise<Collection<T>> {
  const db = await getDb();
  return wrapCollection(db.collection<T>(name));
}

export default connectToDatabase;
