import { ObjectId } from "mongodb";

// Structural type so any sessions collection (typed or untyped) can be passed.
interface SessionQueryable {
  findOne(filter: Record<string, unknown>): Promise<unknown>;
}

/**
 * Find a booked session that would overlap a new booking starting at
 * `dateTime` (sessions run up to 60 minutes). The previous check truncated to
 * the top of the hour, which missed overlaps for bookings starting at :30 —
 * possible when a student is in a half-hour-offset timezone (slot labels are
 * rendered in the student's local time, but conflicts are absolute).
 */
export async function findConflictingSession(
  sessionsCol: SessionQueryable,
  dateTime: Date,
  excludeId?: ObjectId
) {
  const windowStart = new Date(dateTime.getTime() - 60 * 60 * 1000 + 1);
  const windowEnd = new Date(dateTime.getTime() + 60 * 60 * 1000 - 1);
  return sessionsCol.findOne({
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    status: "booked",
    dateTime: { $gt: windowStart, $lt: windowEnd },
  });
}
