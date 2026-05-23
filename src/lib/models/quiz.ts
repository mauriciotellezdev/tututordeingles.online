import { ObjectId } from "mongodb";

export interface QuizQuestionAnswer {
  _id: ObjectId;
  answer: string;
}

export interface QuizQuestion {
  _id: ObjectId;
  question: string;
  answers: QuizQuestionAnswer[];
  correctAnswerId: ObjectId;
}

export interface Quiz {
  _id: ObjectId;
  title: string;
  description: string;
  questions: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

export const QUIZ_COLLECTION = "quizzes";

export function isCorrectAnswer(question: QuizQuestion, answerId: ObjectId): boolean {
  return question.correctAnswerId.equals(answerId);
}

export function createQuizQuestionAnswer(
  input: Omit<QuizQuestionAnswer, "_id">
): QuizQuestionAnswer {
  if (!input.answer.trim()) {
    throw new Error("Answer cannot be empty");
  }
  return { ...input, _id: new ObjectId() };
}

export function createQuizQuestion(
  input: Omit<QuizQuestion, "_id">
): QuizQuestion {
  if (input.answers.length === 0) {
    throw new Error("Question must have at least one answer");
  }
  const correctExists = input.answers.some((a) =>
    a._id.equals(input.correctAnswerId)
  );
  if (!correctExists) {
    throw new Error("correctAnswerId must reference one of the provided answers");
  }
  return { ...input, _id: new ObjectId() };
}

export function createQuiz(
  input: Omit<Quiz, "_id" | "createdAt" | "updatedAt">
): Omit<Quiz, "_id"> {
  if (input.questions.length === 0) {
    throw new Error("Quiz must have at least one question");
  }
  const now = new Date();
  return { ...input, createdAt: now, updatedAt: now };
}