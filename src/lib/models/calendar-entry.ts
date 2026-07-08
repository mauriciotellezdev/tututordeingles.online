import { ObjectId } from "mongodb";

export const CALENDAR_COLLECTION = "calendar_entries";

export interface CalendarEntry {
  _id: ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  activity: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function createCalendarEntry(data: {
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  activity: string;
}): Omit<CalendarEntry, "_id"> {
  const now = new Date();
  return {
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    location: data.location,
    activity: data.activity,
    active: true,
    createdAt: now,
    updatedAt: now,
  };
}
