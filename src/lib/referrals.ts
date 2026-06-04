import { Collection, ObjectId } from "mongodb";
import { randomInt } from "crypto";
import { getCollection } from "@/lib/db";
import { createCredit, CREDIT_COLLECTION } from "@/lib/models/credit";
import { createReferral, REFERRAL_COLLECTION, type Referral } from "@/lib/models/referral";
import { STUDENT_COLLECTION, type Student } from "@/lib/models/student";

const REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const DEFAULT_REFERRAL_REWARD_CREDITS = 1;
const REFERRAL_LOCK_STALE_MINUTES = 10;

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
  const studentsCol = await getCollection<Student>(STUDENT_COLLECTION);
  const studentOid = new ObjectId(studentId);
  const student = await studentsCol.findOne({ _id: studentOid });

  if (!student) {
    throw new Error("Estudiante no encontrado.");
  }

  if (student.referralCode) {
    return { student, referralCode: student.referralCode };
  }

  const referralCode = await generateUniqueReferralCode(studentsCol);
  await studentsCol.updateOne(
    { _id: studentOid, referralCode: { $exists: false } },
    { $set: { referralCode, updatedAt: new Date() } }
  );

  const refreshedStudent = await studentsCol.findOne({ _id: studentOid });
  if (!refreshedStudent) {
    throw new Error("No se pudo actualizar el código de referidos.");
  }

  return { student: refreshedStudent, referralCode };
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

  if (referral.rewardGrantedAt) {
    const existingCredit =
      (referral.rewardCreditId && (await creditsCol.findOne({ _id: referral.rewardCreditId }))) ||
      (await creditsCol.findOne({ stripeChargeId: rewardChargeId }));

    if (!existingCredit) {
      const rewardCredits = referral.rewardCredits ?? DEFAULT_REFERRAL_REWARD_CREDITS;
      const rewardDescription = referral.rewardDescription ?? "Recompensa por referido pagado";
      const insertedCredit = await creditsCol.insertOne(
        createCredit({
          studentId: referral.referrerStudentId.toString(),
          amount: rewardCredits,
          source: "referral",
          description: rewardDescription,
          stripeChargeId: rewardChargeId,
        })
      );

      await referralsCol.updateOne(
        { _id: referral._id },
        { $set: { rewardCreditId: insertedCredit.insertedId } }
      );
    }

    const referrer = await studentsCol.findOne({ _id: referral.referrerStudentId });
    return {
      rewarded: true,
      referralId: referral._id.toString(),
      rewardCredits: referral.rewardCredits ?? DEFAULT_REFERRAL_REWARD_CREDITS,
      referrerStudentId: referral.referrerStudentId.toString(),
      referrerName: referrer?.name,
    };
  }

  const rewardCredits = referral.rewardCredits ?? DEFAULT_REFERRAL_REWARD_CREDITS;
  const rewardDescription = referral.rewardDescription ?? "Recompensa por referido pagado";
  const lockThreshold = new Date(Date.now() - REFERRAL_LOCK_STALE_MINUTES * 60 * 1000);
  const lockResult = await referralsCol.updateOne(
    {
      _id: referral._id,
      rewardGrantedAt: { $exists: false },
      $or: [
        { rewardProcessingAt: { $exists: false } },
        { rewardProcessingAt: { $lt: lockThreshold } },
      ],
    },
    {
      $set: {
        firstPaymentIntentId: paymentIntentId,
        firstPaymentAmount: paymentAmount,
        convertedAt: new Date(),
        rewardProcessingAt: new Date(),
        rewardCredits,
        rewardDescription,
      },
    }
  );

  if (lockResult.modifiedCount === 0) {
    const refreshedReferral = await referralsCol.findOne({ referredStudentId: referredOid });
    if (refreshedReferral?.rewardGrantedAt) {
      return awardReferralRewardForPayment(payload);
    }
    return { rewarded: false };
  }

  const existingRewardCredit = await creditsCol.findOne({ stripeChargeId: rewardChargeId });
  if (existingRewardCredit) {
    await referralsCol.updateOne(
      { _id: referral._id },
      {
        $set: { rewardCreditId: existingRewardCredit._id, rewardGrantedAt: new Date() },
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

  const insertedCredit = await creditsCol.insertOne(
    createCredit({
      studentId: referral.referrerStudentId.toString(),
      amount: rewardCredits,
      source: "referral",
      description: rewardDescription,
      stripeChargeId: rewardChargeId,
    })
  );

  await referralsCol.updateOne(
    { _id: referral._id },
    {
      $set: { rewardCreditId: insertedCredit.insertedId, rewardGrantedAt: new Date() },
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
