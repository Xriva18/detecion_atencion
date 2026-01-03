"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";

export default function CuestionarioPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Mock data - En producción esto vendría de una API
  const mockQuestions = [
    {
      id: "1",
      question: "¿Qué es una derivada?",
      options: [
        "La integral de una función",
        "La tasa de cambio instantánea de una función",
        "El límite de una función",
        "La suma de una función",
      ],
      correctAnswer: "1",
    },
    {
      id: "2",
      question: "¿Cuál es la derivada de f(x) = x²?",
      options: ["x", "2x", "x²", "2x²"],
      correctAnswer: "1",
    },
    {
      id: "3",
      question: "¿Qué representa la derivada en un gráfico?",
      options: [
        "El área bajo la curva",
        "La pendiente de la recta tangente",
        "El punto de intersección",
        "La altura máxima",
      ],
      correctAnswer: "1",
    },
    {
      id: "4",
      question: "¿Cuál es la regla del producto?",
      options: [
        "f'(x) * g'(x)",
        "f'(x) * g(x) + f(x) * g'(x)",
        "f(x) * g(x)",
        "f'(x) + g'(x)",
      ],
      correctAnswer: "1",
    },
    {
      id: "5",
      question: "¿Qué es un punto crítico?",
      options: [
        "Un punto donde la función es cero",
        "Un punto donde la derivada es cero o no existe",
        "Un punto de inflexión",
        "Un punto máximo",
      ],
      correctAnswer: "1",
    },
  ];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    // TODO: Enviar respuestas al backend
    console.log("Respuestas:", answers);
    // Redirigir a resultados después de un delay
    setTimeout(() => {
      router.push("/estudiante/resultados");
    }, 2000);
  };

  const currentQ = mockQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;
  const allAnswered = Object.keys(answers).length === mockQuestions.length;

  if (isSubmitted) {
    return (
      <>
        <Header
          title="Cuestionario"
          subtitle="Procesando tus respuestas"
          user={{
            name: "Sofía",
            email: "sofia@estudiante.com",
            role: "Estudiante",
          }}
        />
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-[#111318]">
              Procesando tus respuestas...
            </p>
            <p className="text-sm text-[#616f89]">
              Serás redirigido a tus resultados en breve
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Cuestionario"
        subtitle={`Pregunta ${currentQuestion + 1} de ${mockQuestions.length}`}
        user={{
          name: "Sofía",
          email: "sofia@estudiante.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#111318]">
              Progreso: {currentQuestion + 1} / {mockQuestions.length}
            </span>
            <span className="text-sm text-[#616f89]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[#111318] mb-6">
            {currentQ.question}
          </h2>
          <div className="flex flex-col gap-3">
            {currentQ.options.map((option, index) => {
              const optionId = index.toString();
              const isSelected = answers[currentQ.id] === optionId;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQ.id, optionId)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-[#e5e7eb] hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                        isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-[#dbdfe6]"
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-sm">
                          check
                        </span>
                      )}
                    </div>
                    <span className="text-base text-[#111318]">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-6 py-3 rounded-lg border border-[#dbdfe6] text-[#111318] hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Anterior
          </button>
          {currentQuestion < mockQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className="px-6 py-3 rounded-lg bg-primary hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Siguiente
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Finalizar Cuestionario
            </button>
          )}
        </div>
      </div>
    </>
  );
}

