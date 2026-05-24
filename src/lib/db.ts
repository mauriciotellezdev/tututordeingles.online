import { MongoClient, Db, Collection, Document, MongoServerError } from "mongodb";

declare global {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  // allow caching on globalThis in dev to avoid exhausting connections
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

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(getDbName());

  // Cache the client and db on global for hot-reload / dev stability
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
    // Embed the details into the error message itself so it always prints
    error.message = `Document failed validation\nerrInfo: ${info}\nerrorResponse: ${response}`;
  }
  throw error;
}

function wrapCollection<T extends Document>(col: Collection<T>): Collection<T> {
  return new Proxy(col, {
    get(target, prop) {
      const original = target[prop as keyof Collection<T>];
      if (typeof original !== 'function') return original;

      // Methods that return cursors (thenable in mongodb v7) — don't await, preserve chaining
      if (prop === 'find' || prop === 'aggregate') {
        return function(this: Collection<T>, ...args: unknown[]) {
          const cursor = (original as Function).apply(this, args) as any;
          return cursor;
        };
      }

      return async (...args: unknown[]) => {
        try {
          return await (original as Function).apply(target, args);
        } catch (error) {
          logValidationError(error);
        }
      };
    }
  });
}

export async function getCollection<T extends Document = any>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return wrapCollection(db.collection<T>(name));
}

export default connectToDatabase;
