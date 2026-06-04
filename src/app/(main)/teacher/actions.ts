"use server";

import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION, Student } from "@/lib/models/student";
import { SESSION_COLLECTION } from "@/lib/models/session";
import { PAYMENT_COLLECTION } from "@/lib/models/payment";
import { CREDIT_COLLECTION } from "@/lib/models/credit";
import { REFERRAL_COLLECTION } from "@/lib/models/referral";

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

    // Compute credit balances for active students
    const creditsCol = await getCollection(CREDIT_COLLECTION);
    const creditBalances = await creditsCol.aggregate<{ studentId: string; total: number }>([
      { $match: { studentId: { $in: activeStudentOids } } },
      { $group: { _id: "$studentId", total: { $sum: "$amount" } } },
      { $project: { studentId: { $toString: "$_id" }, total: 1, _id: 0 } },
    ]).toArray();
    const balanceMap = new Map(creditBalances.map(b => [b.studentId, b.total]));

    const referralsCol = await getCollection(REFERRAL_COLLECTION);
    const recentReferrals = await referralsCol.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 12 },
      {
        $lookup: {
          from: STUDENT_COLLECTION,
          localField: "referrerStudentId",
          foreignField: "_id",
          as: "referrer"
        }
      },
      { $unwind: { path: "$referrer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: STUDENT_COLLECTION,
          localField: "referredStudentId",
          foreignField: "_id",
          as: "referred"
        }
      },
      { $unwind: { path: "$referred", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          referralCodeUsed: 1,
          createdAt: 1,
          convertedAt: 1,
          rewardGrantedAt: 1,
          rewardCredits: 1,
          rewardDescription: 1,
          firstPaymentAmount: 1,
          firstPaymentIntentId: 1,
          referrer: {
            _id: "$referrer._id",
            name: "$referrer.name",
            email: "$referrer.email",
          },
          referred: {
            _id: "$referred._id",
            name: "$referred.name",
            email: "$referred.email",
          }
        }
      }
    ]).toArray();

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
        credits: balanceMap.get(st._id.toString()) || 0,
        quizResult: st.quizResult
      })),
      referrals: recentReferrals.map(referral => ({
        _id: referral._id.toString(),
        referralCodeUsed: referral.referralCodeUsed,
        createdAt: referral.createdAt.toISOString(),
        convertedAt: referral.convertedAt ? referral.convertedAt.toISOString() : null,
        rewardGrantedAt: referral.rewardGrantedAt ? referral.rewardGrantedAt.toISOString() : null,
        rewardCredits: referral.rewardCredits || 0,
        rewardDescription: referral.rewardDescription || "",
        firstPaymentAmount: referral.firstPaymentAmount || 0,
        referrer: referral.referrer?._id ? {
          _id: referral.referrer._id.toString(),
          name: referral.referrer.name,
          email: referral.referrer.email,
        } : null,
        referred: referral.referred?._id ? {
          _id: referral.referred._id.toString(),
          name: referral.referred.name,
          email: referral.referred.email,
        } : null,
      }))
    };
  } catch (error: unknown) {
    console.error("Error in getTeacherDashboardDataAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "Error al cargar datos del profesor.") };
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
