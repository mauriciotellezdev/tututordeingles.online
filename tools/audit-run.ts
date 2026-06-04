import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { MongoClient, type Document } from "mongodb";

type CommandResult = {
  name: string;
  command: string[];
  exitCode: number;
  durationMs: number;
  stdoutPath: string;
  stderrPath: string;
  logPath: string;
  stdout: string;
  stderr: string;
};

type CollectionSnapshot = {
  name: string;
  count: number;
  indexes: Array<{
    name?: string;
    unique?: boolean;
    sparse?: boolean;
    key?: Record<string, unknown>;
  }>;
  duplicateGroups: Array<{ value: unknown; count: number }>;
  expectedIndexes: string[];
  missingIndexes: string[];
};

type DbSnapshot = {
  skipped?: boolean;
  reason?: string;
  dbName?: string;
  target?: "development" | "production" | "custom";
  tlsFallbackUsed?: boolean;
  collections?: CollectionSnapshot[];
};

type RunSummary = {
  startedAt: string;
  finishedAt: string;
  branch: string;
  commit: string;
  auditDir: string;
  env: {
    stagingUrlConfigured: boolean;
    playwrightBaseUrlConfigured: boolean;
    automationBypassConfigured: boolean;
    mongodbDb?: string;
    mongodbUriSource?: string;
  };
  dbBefore: DbSnapshot;
  dbAfter: DbSnapshot;
  commands: CommandResult[];
  brittleFindings: string[];
};

const RUN_ROOT = ".audit";
const TEST_ROOT = join(RUN_ROOT, "runs");
const RELEVANT_COLLECTIONS = new Set([
  "students",
  "referrals",
  "credits",
  "payments",
  "teachers",
  "sessions",
  "quizzes",
]);
const EXPECTED_INDEXES: Record<string, string[]> = {
  students: ["student_referralCode_unique"],
  referrals: [
    "referral_referredStudentId_unique",
    "referral_referrerStudentId_idx",
  ],
  credits: ["credit_stripeChargeId_unique"],
  payments: ["payment_stripePaymentIntentId_unique"],
};
const DUPLICATE_FIELDS: Record<string, string> = {
  students: "referralCode",
  referrals: "referredStudentId",
  credits: "stripeChargeId",
  payments: "stripePaymentIntentId",
};

async function spawnCapture(command: string[], cwd = process.cwd()) {
  const startedAt = Date.now();
  const proc = Bun.spawn({
    cmd: command,
    cwd,
    stdout: "pipe",
    stderr: "pipe",
    env: process.env,
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  return {
    exitCode,
    durationMs: Date.now() - startedAt,
    stdout,
    stderr,
  };
}

function redactEnvSources() {
  const hasPlaywright = Boolean(process.env.PLAYWRIGHT_BASE_URL);
  const hasStaging = Boolean(process.env.STAGING_URL);
  const dbName = process.env.MONGODB_DB;
  const uriSource = process.env.MONGODB_URI
    ? "MONGODB_URI"
    : process.env.MONGODB_URI_DEV
      ? "MONGODB_URI_DEV"
      : process.env.MONGODB_URI_PROD
        ? "MONGODB_URI_PROD"
        : undefined;

  return {
    stagingUrlConfigured: hasStaging,
    playwrightBaseUrlConfigured: hasPlaywright,
    automationBypassConfigured: Boolean(
      process.env.VERCEL_AUTOMATION_BYPASS_SECRET
    ),
    mongodbDb: dbName,
    mongodbUriSource: uriSource,
  };
}

async function getGitInfo() {
  const branch =
    (await spawnCapture(["git", "branch", "--show-current"])).stdout.trim() ||
    "unknown";
  const commit =
    (
      await spawnCapture(["git", "rev-parse", "--short", "HEAD"])
    ).stdout.trim() || "unknown";
  return { branch, commit };
}

function buildDuplicatePipeline(field: string) {
  return [
    {
      $match: {
        [field]: { $exists: true, $nin: [null, ""] },
      },
    },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
    {
      $match: {
        count: { $gt: 1 },
      },
    },
    {
      $sort: { count: -1 as const },
    },
    {
      $limit: 25,
    },
  ];
}

async function snapshotDb(): Promise<DbSnapshot> {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGODB_URI_DEV ||
    process.env.MONGODB_URI_PROD;
  if (!uri) {
    return {
      skipped: true,
      reason: "No MongoDB URI configured in the current environment.",
    };
  }

  const dbName = process.env.MONGODB_DB || "tututordeingles";
  const connectClient = async (allowInvalidCertificates: boolean) => {
    const client = new MongoClient(uri, {
      tlsAllowInvalidCertificates: allowInvalidCertificates || undefined,
      tlsAllowInvalidHostnames: allowInvalidCertificates || undefined,
    });
    await client.connect();
    return client;
  };

  let client: MongoClient;
  let tlsFallbackUsed = false;

  try {
    client = await connectClient(false);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      !/Hostname\/IP does not match certificate's altnames|ERR_TLS_CERT_ALTNAME_INVALID/i.test(
        message
      )
    ) {
      return {
        dbName,
        target: process.env.MONGODB_URI
          ? "custom"
          : process.env.MONGODB_URI_DEV
            ? "development"
            : "production",
        skipped: true,
        reason: message,
      };
    }
    tlsFallbackUsed = true;
    try {
      client = await connectClient(true);
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error
          ? fallbackError.message
          : String(fallbackError);
      return {
        dbName,
        target: process.env.MONGODB_URI
          ? "custom"
          : process.env.MONGODB_URI_DEV
            ? "development"
            : "production",
        tlsFallbackUsed,
        skipped: true,
        reason: message,
      };
    }
  }

  try {
    const db = client.db(dbName);
    const collectionInfos = await db.listCollections().toArray();
    const collections = collectionInfos
      .map((info) => info.name)
      .filter((name) => RELEVANT_COLLECTIONS.has(name));

    const snapshots: CollectionSnapshot[] = [];

    for (const name of collections) {
      const col = db.collection<Document>(name);
      const [count, indexes, duplicateGroups] = await Promise.all([
        col.countDocuments(),
        col.listIndexes().toArray(),
        DUPLICATE_FIELDS[name]
          ? col
              .aggregate<{
                _id: unknown;
                count: number;
              }>(buildDuplicatePipeline(DUPLICATE_FIELDS[name]))
              .toArray()
          : Promise.resolve([] as Array<{ _id: unknown; count: number }>),
      ]);

      const expectedIndexes = EXPECTED_INDEXES[name] ?? [];
      const actualIndexNames = indexes
        .map((index) => index.name)
        .filter(Boolean) as string[];
      const missingIndexes = expectedIndexes.filter(
        (indexName) => !actualIndexNames.includes(indexName)
      );

      snapshots.push({
        name,
        count,
        indexes: indexes.map(({ name, unique, sparse, key }) => ({
          name,
          unique,
          sparse,
          key,
        })),
        duplicateGroups: duplicateGroups.map((group) => ({
          value: group._id,
          count: group.count,
        })),
        expectedIndexes,
        missingIndexes,
      });
    }

    return {
      dbName,
      target: process.env.MONGODB_URI
        ? "custom"
        : process.env.MONGODB_URI_DEV
          ? "development"
          : "production",
      tlsFallbackUsed,
      collections: snapshots,
    };
  } finally {
    await client.close();
  }
}

function collectFindings(
  commandLogs: Array<{ name: string; stdout: string; stderr: string }>,
  dbSnapshot: DbSnapshot,
  env: RunSummary["env"]
) {
  const findings = new Set<string>();

  if (env.stagingUrlConfigured && !env.automationBypassConfigured) {
    findings.add(
      "[env] STAGING_URL is configured but VERCEL_AUTOMATION_BYPASS_SECRET is missing, so protected Vercel previews will redirect Playwright to the login wall."
    );
  }

  for (const { name, stdout, stderr } of commandLogs) {
    const combined = `${stdout}\n${stderr}`;
    const lines = combined.split("\n");

    for (const line of lines) {
      const normalized = line.trim();
      if (!normalized) continue;

      if (
        /strict mode violation/i.test(normalized) ||
        /\btimeout\b/i.test(normalized) ||
        /\berror\b/i.test(normalized) ||
        /\bfail(ed|ure)?\b/i.test(normalized) ||
        /\bwarning\b/i.test(normalized)
      ) {
        findings.add(`[${name}] ${normalized.slice(0, 240)}`);
      }
    }
  }

  for (const collection of dbSnapshot.collections ?? []) {
    if (collection.missingIndexes.length > 0) {
      findings.add(
        `[db:${collection.name}] missing indexes: ${collection.missingIndexes.join(", ")}`
      );
    }
    if (collection.duplicateGroups.length > 0) {
      findings.add(
        `[db:${collection.name}] duplicate groups detected for expected-unique field(s): ${collection.duplicateGroups
          .map((group) => `${String(group.value)} (${group.count})`)
          .join(", ")}`
      );
    }
  }

  return [...findings];
}

async function writeJson(filePath: string, value: unknown) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function main() {
  const startedAt = new Date().toISOString();
  const auditId = startedAt.replace(/[:.]/g, "-");
  const auditDir = join(TEST_ROOT, auditId);
  await mkdir(auditDir, { recursive: true });

  const gitInfo = await getGitInfo();
  const env = redactEnvSources();

  const dbBefore = await snapshotDb();

  const commands = [
    { name: "unit", command: ["bun", "run", "test:unit"] },
    { name: "integration", command: ["bun", "run", "test:integration"] },
    { name: "e2e-staging", command: ["bun", "run", "test:e2e:staging"] },
  ];

  const results: CommandResult[] = [];
  const logHints: Array<{ name: string; stdout: string; stderr: string }> = [];

  for (const entry of commands) {
    const result = await spawnCapture(entry.command);
    const stdoutPath = join(auditDir, `${entry.name}.stdout.log`);
    const stderrPath = join(auditDir, `${entry.name}.stderr.log`);
    const logPath = join(auditDir, `${entry.name}.log`);

    await Promise.all([
      writeFile(stdoutPath, result.stdout),
      writeFile(stderrPath, result.stderr),
      writeFile(logPath, `${result.stdout}${result.stderr}`),
    ]);

    results.push({
      name: entry.name,
      command: entry.command,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
      stdoutPath,
      stderrPath,
      logPath,
      stdout: result.stdout,
      stderr: result.stderr,
    });

    logHints.push({
      name: entry.name,
      stdout: result.stdout,
      stderr: result.stderr,
    });
  }

  const dbAfter = await snapshotDb();
  const findings = collectFindings(logHints, dbAfter, env);

  const summary: RunSummary = {
    startedAt,
    finishedAt: new Date().toISOString(),
    branch: gitInfo.branch,
    commit: gitInfo.commit,
    auditDir,
    env,
    dbBefore,
    dbAfter,
    commands: results,
    brittleFindings: findings,
  };

  await writeJson(join(auditDir, "summary.json"), summary);
  await writeJson(join(auditDir, "db-before.json"), dbBefore);
  await writeJson(join(auditDir, "db-after.json"), dbAfter);
  await writeFile(
    join(auditDir, "summary.md"),
    [
      `# Audit Run`,
      ``,
      `- Branch: \`${summary.branch}\``,
      `- Commit: \`${summary.commit}\``,
      `- Started: \`${summary.startedAt}\``,
      `- Finished: \`${summary.finishedAt}\``,
      `- Audit dir: \`${summary.auditDir}\``,
      `- Staging URL configured: \`${summary.env.stagingUrlConfigured}\``,
      `- Playwright base URL configured: \`${summary.env.playwrightBaseUrlConfigured}\``,
      `- MongoDB DB: \`${summary.env.mongodbDb ?? "unset"}\``,
      `- MongoDB URI source: \`${summary.env.mongodbUriSource ?? "unset"}\``,
      ``,
      `## Commands`,
      ...summary.commands.map(
        (command) =>
          `- \`${command.name}\`: exit \`${command.exitCode}\` in \`${command.durationMs}ms\``
      ),
      ``,
      `## Findings`,
      ...(summary.brittleFindings.length
        ? summary.brittleFindings.map((finding) => `- ${finding}`)
        : [`- No brittle points were detected by the log scanner.`]),
      ``,
      `## Database`,
      ...(summary.dbAfter.collections ?? []).map((collection) => {
        const duplicateSummary =
          collection.duplicateGroups.length > 0
            ? `duplicates: ${collection.duplicateGroups.map((group) => `${String(group.value)} (${group.count})`).join(", ")}`
            : "duplicates: none";
        const missing =
          collection.missingIndexes.length > 0
            ? `missing indexes: ${collection.missingIndexes.join(", ")}`
            : "missing indexes: none";
        return `- \`${collection.name}\`: ${collection.count} docs, ${missing}, ${duplicateSummary}`;
      }),
      ``,
    ].join("\n")
  );

  const failed = summary.commands.filter((command) => command.exitCode !== 0);
  if (failed.length > 0) {
    console.error(
      `Audit completed with ${failed.length} failing command(s). See ${auditDir}/summary.md`
    );
    process.exitCode = 1;
    return;
  }

  console.log(`Audit completed successfully. Logs written to ${auditDir}`);
}

await main();
