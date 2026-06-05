"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "@/shared/ui/progress";
import { AlertCircle, BookOpen, ChevronRight, ChevronLeft } from "lucide-react";
import {
  getCurrentStudentAction,
  getQuizAction,
  submitQuizAction,
  saveQuizProgressAction,
} from "@/app/(student)/placement-quiz/actions";

interface QuizQuestionAnswer {
  _id: string;
  answer: string;
}

interface QuizQuestion {
  _id: string;
  question: string;
  answers: QuizQuestionAnswer[];
}

interface QuizData {
  _id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
}

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  quizResult?: {
    score: number;
    totalQuestions: number;
    completedAt: Date;
  };
  quizProgress?: {
    lastQuestionId: string;
    answeredQuestions: string[];
    updatedAt: Date;
  };
}

export default function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const stepId = unwrappedParams.id;
  const questionNumber = parseInt(stepId, 10) || 1;

  // Student Details
  const [sessionLoading, setSessionLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({}); // questionId -> answerId
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Verify session on load
  useEffect(() => {
    async function verifySession() {
      const res = await getCurrentStudentAction();
      if (!res.success || !res.student) {
        router.push("/signup");
        return;
      }

      // If student has already completed their quiz previously, skip to dashboard
      if (res.student.quizResult) {
        router.push("/student");
        return;
      }
      setStudent(res.student as StudentData);
      setSessionLoading(false);
    }
    verifySession();
  }, [router]);

  // 2. Fetch quiz questions and load answers from localStorage
  useEffect(() => {
    async function loadQuiz() {
      const res = await getQuizAction();
      if (res.success && res.quiz) {
        setQuiz(res.quiz as QuizData);

        // Load progress from localStorage if it exists
        const savedAnswers = localStorage.getItem("placement_quiz_answers");
        if (savedAnswers) {
          try {
            setSelectedAnswers(JSON.parse(savedAnswers));
          } catch (e) {
            console.error("Failed to parse saved quiz progress", e);
          }
        }
      } else {
        setError(res.error || "No se pudo cargar el examen.");
      }
    }
    loadQuiz();
  }, []);

  if (sessionLoading || !quiz || !student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-sm text-white/50">
        Cargando pregunta...
      </main>
    );
  }

  const questions = quiz.questions;
  const totalQuestions = questions.length;

  // Validate step parameter
  if (questionNumber < 1 || questionNumber > totalQuestions) {
    router.push("/quiz/placement/question/1");
    return null;
  }

  const currentQuestionIndex = questionNumber - 1;
  const currentQuestion = questions[currentQuestionIndex];
  const selectedAnswerId = selectedAnswers[currentQuestion._id] || "";

  // Answer handler
  const handleAnswerSelect = (answerId: string) => {
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestion._id]: answerId,
    };
    setSelectedAnswers(updatedAnswers);
    // Persist in localStorage
    localStorage.setItem(
      "placement_quiz_answers",
      JSON.stringify(updatedAnswers)
    );
    setError(null);
  };

  // Next / Submit question handler
  const handleNext = async () => {
    if (!selectedAnswerId) {
      setError("Por favor selecciona una respuesta para continuar.");
      return;
    }
    setError(null);

    if (questionNumber < totalQuestions) {
      // Save progress to localStorage and DB before proceeding
      await saveProgress(currentQuestion._id);
      // Go to next question URL
      router.push(`/quiz/placement/question/${questionNumber + 1}`);
    } else {
      // Last question finished - submit and grade
      setLoading(true);
      setError(null);

      const answersPayload = Object.entries(selectedAnswers).map(
        ([qId, aId]) => ({
          questionId: qId,
          answerId: aId,
        })
      );

      const res = await submitQuizAction({ answers: answersPayload });
      setLoading(false);

      if (res.success) {
        // Clear local storage progress
        localStorage.removeItem("placement_quiz_answers");
        router.push("/quiz/placement/booking");
      } else {
        setError(res.error || "Error al enviar el examen.");
      }
    }
  };

  // Save progress to database
  const saveProgress = async (currentQuestionId: string) => {
    localStorage.setItem(
      "placement_quiz_answers",
      JSON.stringify(selectedAnswers)
    );
    await saveQuizProgressAction({
      questionId: currentQuestionId,
      answers: selectedAnswers,
    });
  };

  // Back button handler
  const handleBack = () => {
    setError(null);
    if (questionNumber > 1) {
      router.push(`/quiz/placement/question/${questionNumber - 1}`);
    }
  };

  const progressPercentage = Math.round(
    (questionNumber / totalQuestions) * 100
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 pt-24 pb-16 text-white">
      {/* Background glow decorations */}
      <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px]" />
      <div className="pointer-events-none absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[100px]" />

      {/* Card Container */}
      <div
        data-testid="quiz-question-page"
        className="animate-fadeIn relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0f1729]/40 p-6 shadow-2xl backdrop-blur-xl md:p-8"
      >
        {/* Step tracker */}
        <div className="mb-6 flex items-center justify-between text-xs font-medium tracking-wider text-white/40 uppercase">
          <span>
            Pregunta {questionNumber} de {totalQuestions}
          </span>
          <span>{progressPercentage}%</span>
        </div>

        {/* Errors */}
        {error && (
          <div className="bg-destructive/10 border-destructive/20 text-destructive animate-slideDown mb-6 flex items-center gap-3 rounded-xl border p-4 text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Progress bar */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="w-full">
            <ProgressTrack className="bg-white/5">
              <ProgressIndicator className="bg-blue-500" />
            </ProgressTrack>
          </Progress>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
            <BookOpen className="size-3" /> Examen de Ubicación
          </span>
          <h3
            data-testid="quiz-question-text"
            className="text-xl leading-tight font-bold text-white md:text-2xl"
          >
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="mb-8 space-y-3">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer._id;
            return (
              <button
                data-testid="quiz-answer-option"
                key={answer._id}
                onClick={() => handleAnswerSelect(answer._id)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/5"
                    : "border-white/[0.06] bg-[#111827]/25 text-white/60 hover:border-white/15 hover:text-white"
                }`}
              >
                <span>{answer.answer}</span>
                <div
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-blue-400 bg-blue-500"
                      : "border-white/20"
                  }`}
                >
                  {isSelected && (
                    <div className="size-2 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <Button
            data-testid="quiz-back-button"
            variant="ghost"
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-full px-5 py-5 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
            disabled={questionNumber === 1 || loading}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <Button
            data-testid="quiz-next-button"
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-full bg-blue-500 px-6 py-5 text-xs font-semibold tracking-wide text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400"
            disabled={loading}
          >
            {questionNumber === totalQuestions ? (
              loading ? (
                "Enviando..."
              ) : (
                "Finalizar y Ver Resultados"
              )
            ) : (
              <>
                Siguiente
                <ChevronRight className="size-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}
