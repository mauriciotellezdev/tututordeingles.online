import { Collection, ObjectId, MongoServerError } from "mongodb";
import { randomInt } from "crypto";
import { getCollection } from "@/lib/db";
import { createCredit, CREDIT_COLLECTION } from "@/lib/models/credit";
import { createReferral, REFERRAL_COLLECTION, type Referral } from "@/lib/models/referral";
import { STUDENT_COLLECTION, type Student } from "@/lib/models/student";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_REFERRAL_REWARD_CREDITS = 1;
let ensureReferralIndexesPromise: Promise<void> | null = null;

export async function ensureReferralIndexes() {
  if (!ensureReferralIndexesPromise) {
    ensureReferralIndexesPromise = (async () => {
      const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
      const creditsCol = await getCollection(CREDIT_COLLECTION);
      const referralsCol = await getCollection<Referral>(REFERRAL_COLLECTION);

      await Promise.all([
        studentsCol.createIndex({ referralCode: 1 }, { unique: true, sparse: true, name: "student_referralCode_unique" }),
        creditsCol.createIndex({ stripeChargeId: 1 }, { unique: true, sparse: true, name: "credit_stripeChargeId_unique" }),
        referralsCol.createIndex({ referredStudentId: 1 }, { unique: true, sparse: true, name: "referral_referredStudentId_unique" }),
        referralsCol.createIndex({ referrerStudentId: 1 }, { name: "referral_referrerStudentId_idx" }),
      ]);
    })().catch((error) => {
      ensureReferralIndexesPromise = null;
      throw error;
    });
  }

  return ensureReferralIndexesPromise;
}

function makeReferralCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += REFERRAL_ALPHABET[randomInt(0, REFERRAL_ALPHABET.length)];
  }
  return code;
}

export async function generateUniqueReferralCode(studentsCol: Collection<Student>) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = makeReferralCode();
    const existing = await studentsCol.findOne({ referralCode: code });
    if (!existing) {
      return code;
    }
  }

  throw new Error("No se pudo generar un código de referidos único.");
}

export function buildReferralLink(baseUrl: string, referralCode: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}/signup?ref=${encodeURIComponent(referralCode)}`;
}

export async function ensureStudentReferralCode(studentId: string) {
  await ensureReferralIndexes();
  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const studentOid = new ObjectId(studentId);
  const student = await studentsCol.findOne({ _id: studentOid });

  if (!student) {
    throw new Error("Estudiante no encontrado.");
  }

  if (student.referralCode) {
    return { student, referralCode: student.referralCode };
  }

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const referralCode = await generateUniqueReferralCode(studentsCol);

    try {
      const result = await studentsCol.updateOne(
        { _id: studentOid, referralCode: { $exists: false } },
        { $set: { referralCode, updatedAt: new Date() } }
      );

      const refreshedStudent = await studentsCol.findOne({ _id: studentOid });
      if (!refreshedStudent) {
        throw new Error("No se pudo actualizar el código de referidos.");
      }

      if (refreshedStudent.referralCode) {
        return { student: refreshedStudent, referralCode: refreshedStudent.referralCode };
      }

      if (result.modifiedCount > 0) {
        return { student: refreshedStudent, referralCode };
      }
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("No se pudo actualizar el código de referidos.");
}

export interface ReferralDashboardSummary {
  referralCode: string;
  referralLink: string;
  totalInvites: number;
  paidConversions: number;
  creditsEarned: number;
  pendingConversions: number;
}

export async function getReferralDashboardSummary(studentId: string, baseUrl: string): Promise<ReferralDashboardSummary> {
  await ensureReferralIndexes();
  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const referralsCol = await getCollection<Referral>(REFERRAL_COLLECTION);
  const creditsCol = await getCollection(CREDIT_COLLECTION);
  const studentOid = new ObjectId(studentId);

  const student = await studentsCol.findOne({ _id: studentOid });
  if (!student) {
    throw new Error("Estudiante no encontrado.");
  }

  let referralCode = student.referralCode;
  if (!referralCode) {
    const ensured = await ensureStudentReferralCode(studentId);
    referralCode = ensured.referralCode;
  }

  const referralLink = buildReferralLink(baseUrl, referralCode);

  const totalInvites = await referralsCol.countDocuments({ referrerStudentId: studentOid });
  const paidConversions = await referralsCol.countDocuments({
    referrerStudentId: studentOid,
    rewardGrantedAt: { $exists: true },
  });
  const pendingConversions = Math.max(totalInvites - paidConversions, 0);

  const creditAgg = await creditsCol.aggregate<{ total: number }>([
    { $match: { studentId: studentOid, source: "referral" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]).toArray();

  const creditsEarned = creditAgg.length > 0 ? creditAgg[0].total : 0;

  return {
    referralCode,
    referralLink,
    totalInvites,
    paidConversions,
    creditsEarned,
    pendingConversions,
  };
}

export interface ReferralRewardResult {
  rewarded: boolean;
  referralId?: string;
  rewardCredits?: number;
  referrerStudentId?: string;
  referrerName?: string;
}

export async function awardReferralRewardForPayment(payload: {
  referredStudentId: string;
  paymentIntentId: string;
  paymentAmount: number;
}): Promise<ReferralRewardResult> {
  await ensureReferralIndexes();
  const { referredStudentId, paymentIntentId, paymentAmount } = payload;
  const referralsCol = await getCollection<Referral>(REFERRAL_COLLECTION);
  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const creditsCol = await getCollection(CREDIT_COLLECTION);
  const referredOid = new ObjectId(referredStudentId);
  const rewardChargeId = `referral:${paymentIntentId}`;

  const referral = await referralsCol.findOne({ referredStudentId: referredOid });
  if (!referral) {
    return { rewarded: false };
  }

  const rewardCredits = referral.rewardCredits ?? DEFAULT_REFERRAL_REWARD_CREDITS;
  const rewardDescription = referral.rewardDescription ?? "Recompensa por referido pagado";
  const existingCredit =
    (referral.rewardCreditId && (await creditsCol.findOne({ _id: referral.rewardCreditId }))) ||
    (await creditsCol.findOne({ stripeChargeId: rewardChargeId }));

  let rewardCreditId = existingCredit?._id;
  if (!rewardCreditId) {
    try {
      const insertedCredit = await creditsCol.insertOne(
        createCredit({
          studentId: referral.referrerStudentId.toString(),
          amount: rewardCredits,
          source: "referral",
          description: rewardDescription,
          stripeChargeId: rewardChargeId,
        })
      );
      rewardCreditId = insertedCredit.insertedId;
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) {
        const duplicateCredit = await creditsCol.findOne({ stripeChargeId: rewardChargeId });
        rewardCreditId = duplicateCredit?._id;
      } else {
        throw error;
      }
    }
  }

  if (!rewardCreditId) {
    return { rewarded: false };
  }

  await referralsCol.updateOne(
    { _id: referral._id },
    {
      $set: {
        firstPaymentIntentId: paymentIntentId,
        firstPaymentAmount: paymentAmount,
        convertedAt: new Date(),
        rewardCredits,
        rewardCreditId,
        rewardGrantedAt: new Date(),
        rewardDescription,
      },
      $unset: { rewardProcessingAt: "" },
    }
  );

  const referrer = await studentsCol.findOne({ _id: referral.referrerStudentId });

  return {
    rewarded: true,
    referralId: referral._id.toString(),
    rewardCredits,
    referrerStudentId: referral.referrerStudentId.toString(),
    referrerName: referrer?.name,
  };
}
