"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { SESSION_COLLECTION } from "@/lib/models/session";
import { PAYMENT_COLLECTION } from "@/lib/models/payment";

/**
 * Action 1: Get teacher dashboard data (upcoming sessions & active students)
 */
export async function getTeacherDashboardDataAction() {
  try {
    const cookieStore = await cookies();
    const isTeacher = cookieStore.get("teacher_session")?.value === "true";

    if (!isTeacher) {
      return { success: false, error: "No autorizado." };
    }

    const sessionsCol = await getCollection(SESSION_COLLECTION);
    const now = new Date();

    // 1. Fetch upcoming sessions with student details joined
    const upcomingSessions = await sessionsCol.aggregate([
      {
        $match: {
          status: "booked",
          dateTime: { $gte: now }
        }
      },
      {
        $lookup: {
          from: STUDENT_COLLECTION,
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: "$student"
      },
      {
        $sort: { dateTime: 1 }
      }
    ]).toArray();

    // 2. Fetch active students (booked sessions or paid in the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const paymentsCol = await getCollection(PAYMENT_COLLECTION);
    const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);

    // Find student IDs from sessions in last 30 days
    const studentIdsFromSessions = await sessionsCol.distinct("studentId", {
      dateTime: { $gte: thirtyDaysAgo }
    });

    // Find student IDs from payments in last 30 days
    const studentIdsFromPayments = await paymentsCol.distinct("studentId", {
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Merge and deduplicate
    const activeStudentIdStrings = new Set([
      ...studentIdsFromSessions.map(id => id.toString()),
      ...studentIdsFromPayments.map(id => id.toString())
    ]);

    const activeStudentOids = Array.from(activeStudentIdStrings).map(idStr => new ObjectId(idStr));

    // Retrieve full details of active students
    const activeStudents = await studentsCol.find({
      _id: { $in: activeStudentOids }
    }).toArray();

    return {
      success: true,
      upcomingSessions: upcomingSessions.map(s => ({
        _id: s._id.toString(),
        type: s.type,
        dateTime: s.dateTime.toISOString(),
        duration: s.duration,
        meetingLink: s.meetingLink,
        status: s.status,
        paid: s.paid,
        student: {
          _id: s.student._id.toString(),
          name: s.student.name,
          email: s.student.email,
          phone: s.student.phone
        }
      })),
      activeStudents: activeStudents.map(st => ({
        _id: st._id.toString(),
        name: st.name,
        email: st.email,
        phone: st.phone,
        credits: st.credits || 0,
        quizResult: st.quizResult
      }))
    };
  } catch (error: any) {
    console.error("Error in getTeacherDashboardDataAction:", error);
    return { success: false, error: error.message || "Error al cargar datos del profesor." };
  }
}

/**
 * Action 2: Teacher logout
 */
export async function teacherLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("teacher_session");
  return { success: true };
}
