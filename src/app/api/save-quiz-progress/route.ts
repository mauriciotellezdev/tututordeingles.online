import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import { STUDENT_COLLECTION } from "@/lib/models/student";

export async function POST(request: Request) {
  try {
    const { studentId, questionId, answers } = await request.json();

    // Validate input
    if (!studentId || !questionId) {
      return NextResponse.json(
        { error: "Student ID and question ID are required" },
        { status: 400 }
      );
    }

    const studentsCol = await getCollection<any>(STUDENT_COLLECTION);
    
    // Update student's quiz progress
    const updateData: any = {
      $set: {
        "quizProgress": {
          lastQuestionId: questionId,
          answeredQuestions: Object.keys(answers),
          updatedAt: new Date()
        },
        updatedAt: new Date()
      }
    };

    await studentsCol.updateOne(
      { _id: new ObjectId(studentId) },
      updateData
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving quiz progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save quiz progress" },
      { status: 500 }
    );
  }
}