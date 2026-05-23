import { MongoClient, Db, Collection, Document } from "mongodb";

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

export async function getCollection<T extends Document = any>(name: string): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

export default connectToDatabase;
