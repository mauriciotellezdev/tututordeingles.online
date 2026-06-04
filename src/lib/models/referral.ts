import { ObjectId } from "mongodb";

export const REFERRAL_COLLECTION = "referrals";

export interface Referral {
  _id: ObjectId;
  referrerStudentId: ObjectId;
  referredStudentId: ObjectId;
  referralCodeUsed: string;
  referredStudentEmail: string;
  createdAt: Date;
  firstPaymentIntentId?: string;
  firstPaymentAmount?: number;
  convertedAt?: Date;
  rewardProcessingAt?: Date;
  rewardGrantedAt?: Date;
  rewardCredits?: number;
  rewardCreditId?: ObjectId;
  rewardDescription?: string;
}

export interface CreateReferralInput {
  referrerStudentId: string;
  referredStudentId: string;
  referralCodeUsed: string;
  referredStudentEmail: string;
}

export function createReferral(input: CreateReferralInput): Omit<Referral, "_id"> {
  return {
    referrerStudentId: new ObjectId(input.referrerStudentId),
    referredStudentId: new ObjectId(input.referredStudentId),
    referralCodeUsed: input.referralCodeUsed.trim().toUpperCase(),
    referredStudentEmail: input.referredStudentEmail.toLowerCase().trim(),
    createdAt: new Date(),
  };
}
