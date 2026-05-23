"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { Progress, ProgressTrack, ProgressIndicator } from "@/shared/ui/progress";
import { AlertCircle, BookOpen, ChevronRight, ChevronLeft } from "lucide-react";
import { getCurrentStudentAction, getQuizAction, submitQuizAction } from "@/app/placement-quiz/actions";

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

export default function QuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const stepId = unwrappedParams.id;
  const questionNumber = parseInt(stepId, 10) || 1;

  // Student Details
  const [sessionLoading, setSessionLoading] = useState(true);

  // Quiz State
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> answerId
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
      setSessionLoading(false);
    }
    verifySession();
  }, [router]);

  // 2. Fetch quiz questions and load answers from localStorage
  useEffect(() => {
    async function loadQuiz() {
      const res = await getQuizAction();
      if (res.success && res.quiz) {
        setQuiz(res.quiz as any);
        
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

  if (sessionLoading || !quiz) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-sm">
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
      [currentQuestion._id]: answerId
    };
    setSelectedAnswers(updatedAnswers);
    // Persist in localStorage
    localStorage.setItem("placement_quiz_answers", JSON.stringify(updatedAnswers));
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
      // Go to next question URL
      router.push(`/quiz/placement/question/${questionNumber + 1}`);
    } else {
      // Last question finished - submit and grade
      setLoading(true);
      setError(null);

      const answersPayload = Object.entries(selectedAnswers).map(([qId, aId]) => ({
        questionId: qId,
        answerId: aId
      }));

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

  // Back button handler
  const handleBack = () => {
    setError(null);
    if (questionNumber > 1) {
      router.push(`/quiz/placement/question/${questionNumber - 1}`);
    }
  };

  const progressPercentage = Math.round((questionNumber / totalQuestions) * 100);

  return (
    <main className="min-h-screen bg-[#0a0a0a] pt-24 pb-16 flex flex-col items-center justify-center px-4 relative overflow-hidden text-white">
      {/* Background glow decorations */}
      <div className="absolute left-[-10%] top-[-10%] w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Card Container */}
      <div className="w-full max-w-xl bg-[#0f1729]/40 border border-white/[0.08] backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10 animate-fadeIn">
        
        {/* Step tracker */}
        <div className="mb-6 flex justify-between items-center text-xs text-white/40 font-medium uppercase tracking-wider">
          <span>Pregunta {questionNumber} de {totalQuestions}</span>
          <span>{progressPercentage}%</span>
        </div>

        {/* Errors */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-3 animate-slideDown">
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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 mb-4">
            <BookOpen className="size-3" /> Examen de Ubicación
          </span>
          <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
            {currentQuestion.question}
          </h3>
        </div>

        {/* Answer Options */}
        <div className="space-y-3 mb-8">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer._id;
            return (
              <button
                key={answer._id}
                onClick={() => handleAnswerSelect(answer._id)}
                className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? "border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/5"
                    : "border-white/[0.06] bg-[#111827]/25 text-white/60 hover:border-white/15 hover:text-white"
                }`}
              >
                <span>{answer.answer}</span>
                <div className={`size-4 rounded-full border flex items-center justify-center shrink-0 ${
                  isSelected ? "border-blue-400 bg-blue-500" : "border-white/20"
                }`}>
                  {isSelected && <div className="size-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="rounded-full px-5 py-5 text-white/50 hover:text-white hover:bg-white/5 text-xs font-semibold flex items-center gap-1.5"
            disabled={questionNumber === 1 || loading}
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            className="bg-blue-500 hover:bg-blue-400 text-white rounded-full px-6 py-5 text-xs font-semibold tracking-wide transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
            disabled={loading}
          >
            {questionNumber === totalQuestions ? (
              loading ? "Enviando..." : "Finalizar y Ver Resultados"
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
