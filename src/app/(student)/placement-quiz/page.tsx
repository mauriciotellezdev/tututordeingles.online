"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentStudentAction } from "./actions";

export default function PlacementQuizRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      const res = await getCurrentStudentAction();
      if (!res.success || !res.student) {
        router.push("/signup");
        return;
      }

      if (res.student.quizResult) {
        router.push("/student");
      } else {
        // If student has quiz progress, redirect to the last unanswered question
        if (res.student.quizProgress) {
          // Find the next unanswered question
          const lastQuestionId = res.student.quizProgress.lastQuestionId;
          if (lastQuestionId) {
            router.push(`/quiz/placement/question/${lastQuestionId}`);
          } else {
            router.push("/quiz/placement/question/1");
          }
        } else {
          router.push("/quiz/placement/question/1");
        }
      }
    }
    handleRedirect();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
      Cargando tu examen de ubicación...
    </main>
  );
}
