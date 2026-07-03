import { ObjectId } from "mongodb";

type AnyRecord = Record<string, unknown>;

type UpdateSpec<T extends AnyRecord> = {
  $set?: Partial<T> & AnyRecord;
  $unset?: Record<string, "" | 1 | true>;
  $setOnInsert?: Partial<T> & AnyRecord;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof ObjectId)
  );
}

function getPathValue(source: AnyRecord, path: string) {
  return path.split(".").reduce<unknown>((current, segment) => {
    if (current == null) {
      return undefined;
    }
    return (current as AnyRecord)[segment];
  }, source);
}

const OPERATOR_KEYS = ["$exists", "$gte", "$lte", "$gt", "$lt", "$ne", "$in"];

function matchesValue(actual: unknown, expected: unknown): boolean {
  if (
    isPlainObject(expected) &&
    Object.keys(expected).some((k) => OPERATOR_KEYS.includes(k))
  ) {
    // Operator objects are conjunctive: every operator present must hold
    // (e.g. { $gt: a, $lt: b } is a range).
    return Object.entries(expected).every(([op, operand]) => {
      switch (op) {
        case "$exists":
          return Boolean(operand) ? actual !== undefined : actual === undefined;
        case "$gte":
          return Number(actual) >= Number(operand);
        case "$lte":
          return Number(actual) <= Number(operand);
        case "$gt":
          return Number(actual) > Number(operand);
        case "$lt":
          return Number(actual) < Number(operand);
        case "$ne":
          return !matchesValue(actual, operand);
        case "$in":
          return (
            Array.isArray(operand) &&
            operand.some((item) => matchesValue(actual, item))
          );
        default:
          return false;
      }
    });
  }

  if (actual instanceof ObjectId || expected instanceof ObjectId) {
    return String(actual) === String(expected);
  }

  if (actual instanceof Date || expected instanceof Date) {
    return (
      new Date(String(actual)).getTime() ===
      new Date(String(expected)).getTime()
    );
  }

  return actual === expected;
}

function matchesFilter(doc: AnyRecord, filter: AnyRecord): boolean {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or" && Array.isArray(expected)) {
      return expected.some((branch) => matchesFilter(doc, branch));
    }

    const actual = key.includes(".") ? getPathValue(doc, key) : doc[key];
    return matchesValue(actual, expected);
  });
}

function applyUpdate<T extends AnyRecord>(doc: T, update: UpdateSpec<T>) {
  if (update.$set) {
    Object.assign(doc, update.$set);
  }

  if (update.$unset) {
    for (const key of Object.keys(update.$unset)) {
      delete (doc as AnyRecord)[key];
    }
  }
}

export function createMemoryCollection<T extends AnyRecord>(initial: T[] = []) {
  const docs: Array<T & { _id: ObjectId }> = initial.map((doc) => {
    const rawDoc = doc as AnyRecord;
    const existingId = rawDoc._id;

    return {
      ...(doc as T),
      _id: existingId instanceof ObjectId ? existingId : new ObjectId(),
    } as T & { _id: ObjectId };
  });

  return {
    docs,
    async createIndex() {
      return "index";
    },
    async findOne(filter: AnyRecord) {
      return docs.find((doc) => matchesFilter(doc, filter)) ?? null;
    },
    async insertOne(document: T & { _id?: ObjectId }) {
      const stored = {
        ...(document as Record<string, unknown>),
        _id: document._id instanceof ObjectId ? document._id : new ObjectId(),
      } as T & { _id: ObjectId };

      docs.push(stored);
      return { insertedId: stored._id };
    },
    async updateOne(
      filter: AnyRecord,
      update: UpdateSpec<T>,
      options?: { upsert?: boolean }
    ) {
      const match = docs.find((doc) => matchesFilter(doc, filter));
      if (match) {
        applyUpdate(match, update);
        return {
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
          upsertedId: null,
        };
      }

      if (options?.upsert) {
        const stored = {
          ...(update.$setOnInsert ?? {}),
          ...(update.$set ?? {}),
          _id: new ObjectId(),
        } as T & { _id: ObjectId };
        docs.push(stored);
        return {
          matchedCount: 0,
          modifiedCount: 0,
          upsertedCount: 1,
          upsertedId: stored._id,
        };
      }

      return {
        matchedCount: 0,
        modifiedCount: 0,
        upsertedCount: 0,
        upsertedId: null,
      };
    },
    find(filter: AnyRecord) {
      const current = docs.filter((doc) => matchesFilter(doc, filter));

      return {
        project() {
          return {
            toArray: async () => [...current],
          };
        },
        toArray: async () => [...current],
      };
    },
    async deleteOne(filter: AnyRecord) {
      const index = docs.findIndex((doc) => matchesFilter(doc, filter));
      if (index === -1) {
        return { deletedCount: 0 };
      }
      docs.splice(index, 1);
      return { deletedCount: 1 };
    },
    async countDocuments(filter: AnyRecord) {
      return docs.filter((doc) => matchesFilter(doc, filter)).length;
    },
    aggregate(pipeline: Array<AnyRecord>) {
      let current: AnyRecord[] = [...docs];

      for (const stage of pipeline) {
        if (stage.$match) {
          current = current.filter((doc) =>
            matchesFilter(doc, stage.$match as AnyRecord)
          );
        }

        if (stage.$group) {
          const groupStage = stage.$group as {
            total?: { $sum?: string | number };
          };
          const sumSpec = groupStage.total?.$sum;
          const total = current.reduce((acc, doc) => {
            if (typeof sumSpec === "number") {
              return acc + sumSpec;
            }
            if (typeof sumSpec === "string" && sumSpec.startsWith("$")) {
              const field = sumSpec.slice(1);
              return acc + Number(doc[field] ?? 0);
            }
            return acc;
          }, 0);
          current = [{ _id: null, total }];
        }
      }

      return {
        toArray: async () => current,
      };
    },
  };
}
