import { getCollection } from "@/lib/db";
import {
  CALENDAR_COLLECTION,
  CalendarEntry,
} from "@/lib/models/calendar-entry";

export interface SessionDisplay {
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  activity: string;
  dateLabel: string;
}

/** The fixed time slots applied to each upcoming Sunday by default. */
const SLOTS: Array<{ startTime: string; endTime: string; activity: string }> = [
  {
    startTime: "11:00",
    endTime: "12:30",
    activity: "Conversación en inglés en grupo",
  },
  {
    startTime: "17:00",
    endTime: "18:30",
    activity: "Conversación en inglés en grupo",
  },
];

// First sessions are at Starbucks; later Sundays rotate through markets, cafés,
// movies and restaurants for real-world English practice.
const DEFAULT_LOCATION = "Starbucks Tehuacán";

/** How many upcoming sessions to show on the homepage calendar. */
const SESSION_COUNT = 4;

function getNextSunday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Build the default rolling schedule: the next Sundays × the two slots. */
function defaultSessions(): SessionDisplay[] {
  const firstSunday = getNextSunday();
  const sessions: SessionDisplay[] = [];
  for (let week = 0; sessions.length < SESSION_COUNT; week += 1) {
    const date = new Date(firstSunday);
    date.setDate(firstSunday.getDate() + week * 7);
    for (const slot of SLOTS) {
      if (sessions.length >= SESSION_COUNT) break;
      sessions.push({
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        location: DEFAULT_LOCATION,
        activity: slot.activity,
        dateLabel: formatDateLabel(date),
      });
    }
  }
  return sessions;
}

export async function getUpcomingSessions(): Promise<SessionDisplay[]> {
  try {
    const col = await getCollection<CalendarEntry>(CALENDAR_COLLECTION);
    const rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);

    const entries = await col
      .find({ date: { $gte: rangeStart }, active: true })
      .sort({ date: 1, startTime: 1 })
      .limit(SESSION_COUNT)
      .toArray();

    if (entries.length === 0) {
      return defaultSessions();
    }

    return entries.map((e) => ({
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      activity: e.activity,
      dateLabel: formatDateLabel(e.date),
    }));
  } catch {
    return defaultSessions();
  }
}
