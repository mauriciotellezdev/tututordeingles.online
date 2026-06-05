import { beforeEach, expect, mock, spyOn, test } from "bun:test";
import { ObjectId } from "mongodb";
import { createMemoryCollection } from "../helpers/memory-collection";

let collections: ReturnType<typeof buildCollections>;
let consoleWarnSpy: ReturnType<typeof spyOn>;

function buildCollections() {
  const studentId = new ObjectId();
  const teacherId = new ObjectId();
  const now = new Date("2026-06-04T12:00:00.000Z");

  return {
    studentId,
    students: createMemoryCollection([
      {
        _id: studentId,
        name: "Gabriela Martínez González",
        email: "gaviy1987@gmail.com",
        phone: "2381319616",
        createdAt: now,
        updatedAt: now,
      },
    ]),
    teachers: createMemoryCollection([
      {
        _id: teacherId,
        name: "Mauricio Tellez",
        email: "mauriciotellezdev@gmail.com",
        phone: "522225118581",
        createdAt: now,
        updatedAt: now,
      },
    ]),
    sessions: createMemoryCollection([]),
  };
}

const sendMail = mock(async () => undefined);

mock.module("next/headers", () => ({
  cookies: async () => ({
    get: mock((name: string) =>
      name === "student_id"
        ? { value: collections.studentId.toString() }
        : undefined
    ),
    set: mock(() => undefined),
  }),
  headers: async () => ({
    get: (name: string) => {
      if (name === "user-agent") {
        return "Playwright";
      }
      if (name === "x-forwarded-for") {
        return "203.0.113.10";
      }
      return null;
    },
  }),
}));

mock.module("../../src/lib/db", () => ({
  getCollection: async (name: string) => {
    if (!collections) {
      throw new Error("Collections not initialized");
    }

    switch (name) {
      case "students":
        return collections.students;
      case "teachers":
        return collections.teachers;
      case "sessions":
        return collections.sessions;
      default:
        throw new Error(`Unexpected collection: ${name}`);
    }
  },
}));

mock.module("../../src/lib/mail", () => ({
  sendMail,
}));

const bookingModulePromise =
  import("../../src/app/(student)/placement-quiz/actions");

beforeEach(() => {
  collections = buildCollections();
  sendMail.mockReset();
  sendMail.mockResolvedValue(undefined);
  consoleWarnSpy = spyOn(console, "warn").mockImplementation(() => undefined);
});

test("bookIntroCallAction sends both student and owner booking emails", async () => {
  const { bookIntroCallAction } = await bookingModulePromise;

  const result = await bookIntroCallAction({
    dateTimeIso: "2026-06-07T19:00:00.000Z",
  });

  expect(result.success).toBe(true);
  expect(collections.sessions.docs).toHaveLength(1);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(sendMail.mock.calls[0]?.[0]?.to).toBe("gaviy1987@gmail.com");
  expect(sendMail.mock.calls[1]?.[0]?.to).toBe("mauriciotellezdev@gmail.com");
});

test("bookIntroCallAction still succeeds when the owner notification fails", async () => {
  const { bookIntroCallAction } = await bookingModulePromise;
  sendMail.mockResolvedValueOnce(undefined).mockImplementationOnce(async () => {
    throw new Error("owner mail down");
  });

  const result = await bookIntroCallAction({
    dateTimeIso: "2026-06-07T20:00:00.000Z",
  });

  expect(result.success).toBe(true);
  expect(collections.sessions.docs).toHaveLength(1);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
});
