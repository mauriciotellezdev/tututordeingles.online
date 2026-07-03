import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { SESSION_COLLECTION, type Session } from "@/lib/models/session";
import { STUDENT_COLLECTION, type Student } from "@/lib/models/student";
import { getTeacherData } from "@/lib/models/teacher";
import { sendMail } from "@/lib/mail";

// Daily reminder job (Vercel Cron → see vercel.json). Emails students about
// booked classes happening in the next 24h, once each. Reminder state lives in
// its own `reminders_sent` collection (keyed by session id) so it never touches
// the strict sessions validator.
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const REMINDERS_COLLECTION = "reminders_sent";

export async function GET(request: Request) {
  // Fail closed: only Vercel Cron (which sends `Authorization: Bearer
  // <CRON_SECRET>` when CRON_SECRET is set) may trigger this. No secret → 401.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const sessionsCol = await getCollection<Session>(SESSION_COLLECTION);
    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
    const remindersCol = await getCollection<{ _id: string; sentAt: Date }>(
      REMINDERS_COLLECTION
    );
    const teacher = await getTeacherData();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = await sessionsCol
      .find({ status: "booked", dateTime: { $gte: now, $lte: in24h } })
      .toArray();

    let sent = 0;
    for (const session of upcoming) {
      const sessionId = session._id.toString();
      const already = await remindersCol.findOne({ _id: sessionId });
      if (already) continue;

      const student = await studentsCol.findOne({ _id: session.studentId });
      if (!student) continue;

      const whenStr = new Date(session.dateTime).toLocaleString("es-MX", {
        timeZone: "America/Mexico_City",
      });

      try {
        await sendMail({
          to: student.email,
          subject: "Recordatorio: tu clase de inglés es pronto 🔔",
          text: `Hola ${student.name},\n\nTe recordamos tu próxima clase de inglés:\n${whenStr} (hora CDMX)\n\nNos vemos por WhatsApp con Mauricio: ${teacher.phone}\n\n¿Necesitas reprogramar o cancelar? Entra a tu panel:\n${appUrl}/student\n\n¡Nos vemos en clase!\nMauricio Tellez`,
        });
        await remindersCol.updateOne(
          { _id: sessionId },
          { $set: { sentAt: new Date() } },
          { upsert: true }
        );
        sent += 1;
      } catch (mailError) {
        console.warn(`Reminder failed for session ${sessionId}:`, mailError);
      }
    }

    return NextResponse.json({ ok: true, checked: upcoming.length, sent });
  } catch (error) {
    console.error("Reminder cron error:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
