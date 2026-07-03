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
        email: "mauricio@tututordeingles.online",
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

  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const result = await bookIntroCallAction({
    dateTimeIso: futureDate.toISOString(),
  });

  expect(result.success).toBe(true);
  expect(collections.sessions.docs).toHaveLength(1);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(sendMail.mock.calls[0]?.[0]?.to).toBe("gaviy1987@gmail.com");
  expect(sendMail.mock.calls[1]?.[0]?.to).toBe(
    "mauricio@tututordeingles.online"
  );
});

test("bookIntroCallAction still succeeds when the owner notification fails", async () => {
  const { bookIntroCallAction } = await bookingModulePromise;
  sendMail.mockResolvedValueOnce(undefined).mockImplementationOnce(async () => {
    throw new Error("owner mail down");
  });

  const futureDate = new Date(Date.now() + 72 * 60 * 60 * 1000);
  const result = await bookIntroCallAction({
    dateTimeIso: futureDate.toISOString(),
  });

  expect(result.success).toBe(true);
  expect(collections.sessions.docs).toHaveLength(1);
  expect(sendMail).toHaveBeenCalledTimes(2);
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
});

test("bookIntroCallAction rejects a booking that overlaps by 30 minutes", async () => {
  const { bookIntroCallAction } = await bookingModulePromise;

  // A :30 start time — what a half-hour-offset timezone produces.
  const first = new Date(Date.now() + 96 * 60 * 60 * 1000);
  first.setMinutes(30, 0, 0);
  const firstResult = await bookIntroCallAction({
    dateTimeIso: first.toISOString(),
  });
  expect(firstResult.success).toBe(true);

  // 30 minutes later, at the top of the NEXT hour — the running :30 session
  // still overlaps it, but the old hour-bucket check looked only inside
  // [H+1, H+2) and let it through. The overlap window must reject it.
  const overlapping = new Date(first.getTime() + 30 * 60 * 1000);
  const overlapResult = await bookIntroCallAction({
    dateTimeIso: overlapping.toISOString(),
  });
  expect(overlapResult.success).toBe(false);
  expect(overlapResult.error).toContain("ocupado");
  expect(collections.sessions.docs).toHaveLength(1);
});

test("getBookedSlotsAction maps booked UTC sessions to the browser timezone", async () => {
  const { getBookedSlotsAction } = await bookingModulePromise;
  const bookedDate = new Date("2026-06-06T19:00:00.000Z");
  await collections.sessions.insertOne({
    _id: new ObjectId(),
    studentId: collections.studentId,
    type: "intro",
    dateTime: bookedDate,
    duration: 30,
    status: "booked",
    createdAt: bookedDate,
    updatedAt: bookedDate,
  });

  const result = await getBookedSlotsAction({
    dateIso: "2026-06-06T06:00:00.000Z",
    timeZone: "America/Mexico_City",
  });

  expect(result.success).toBe(true);
  expect(result.bookedSlots).toContain("13:00");
});
