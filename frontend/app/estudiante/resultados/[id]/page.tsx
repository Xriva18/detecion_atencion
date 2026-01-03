"use client";

import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";

export default function DetalleResultadoPage() {
  const params = useParams();
  const router = useRouter();
  const resultId = params.id as string;

  // Mock data - En producción esto vendría de una API
  const mockResult = {
    id: resultId,
    videoTitle: "Introducción a las Derivadas",
    className: "Cálculo Diferencial",
    professor: "Prof. Alejandro García",
    date: "2024-01-20",
    score: 85,
    correctAnswers: 17,
    incorrectAnswers: 3,
    totalQuestions: 20,
    attentionLevel: "Alto" as "Alto" | "Medio" | "Bajo",
    questions: [
      {
        id: "1",
        question: "¿Qué es una derivada?",
        userAnswer: "La tasa de cambio instantánea de una función",
        correctAnswer: "La tasa de cambio instantánea de una función",
        isCorrect: true,
      },
      {
        id: "2",
        question: "¿Cuál es la derivada de f(x) = x²?",
        userAnswer: "2x",
        correctAnswer: "2x",
        isCorrect: true,
      },
      {
        id: "3",
        question: "¿Qué representa la derivada en un gráfico?",
        userAnswer: "La pendiente de la recta tangente",
        correctAnswer: "La pendiente de la recta tangente",
        isCorrect: true,
      },
      {
        id: "4",
        question: "¿Cuál es la regla del producto?",
        userAnswer: "f'(x) * g(x) + f(x) * g'(x)",
        correctAnswer: "f'(x) * g(x) + f(x) * g'(x)",
        isCorrect: true,
      },
      {
        id: "5",
        question: "¿Qué es un punto crítico?",
        userAnswer: "Un punto donde la derivada es cero",
        correctAnswer: "Un punto donde la derivada es cero o no existe",
        isCorrect: false,
      },
    ],
  };

  const getAttentionBadgeColor = (level: "Alto" | "Medio" | "Bajo") => {
    if (level === "Alto")
      return "bg-green-100 text-green-700 border-green-200";
    if (level === "Medio")
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <>
      <Header
        title="Detalle de Resultado"
        subtitle={mockResult.videoTitle}
        user={{
          name: "Sofía",
          email: "sofia@estudiante.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#616f89] hover:text-[#111318] transition-colors self-start"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Volver a Resultados</span>
        </button>

        {/* Summary Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <p className="text-sm text-[#616f89] mb-1">Calificación</p>
              <p className="text-3xl font-bold text-primary">{mockResult.score}%</p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#616f89] mb-1">Correctas</p>
              <p className="text-3xl font-bold text-green-600">
                {mockResult.correctAnswers}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#616f89] mb-1">Incorrectas</p>
              <p className="text-3xl font-bold text-red-600">
                {mockResult.incorrectAnswers}
              </p>
            </div>
            <div className="flex flex-col">
              <p className="text-sm text-[#616f89] mb-1">Nivel de Atención</p>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold border w-fit ${getAttentionBadgeColor(
                  mockResult.attentionLevel
                )}`}
              >
                {mockResult.attentionLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#111318] mb-4">
            Información del Video
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#616f89] mb-1">Video</p>
              <p className="text-base font-medium text-[#111318]">
                {mockResult.videoTitle}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#616f89] mb-1">Clase</p>
              <p className="text-base font-medium text-[#111318]">
                {mockResult.className}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#616f89] mb-1">Profesor</p>
              <p className="text-base font-medium text-[#111318]">
                {mockResult.professor}
              </p>
            </div>
            <div>
              <p className="text-sm text-[#616f89] mb-1">Fecha</p>
              <p className="text-base font-medium text-[#111318]">
                {new Date(mockResult.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-xl font-bold text-[#111318]">
              Revisión de Preguntas
            </h2>
          </div>
          <div className="p-6 flex flex-col gap-6">
            {mockResult.questions.map((question, index) => (
              <div
                key={question.id}
                className={`p-4 rounded-lg border-2 ${
                  question.isCorrect
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      question.isCorrect
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {question.isCorrect ? "check" : "close"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#616f89] mb-1">
                      Pregunta {index + 1}
                    </p>
                    <p className="text-base font-medium text-[#111318]">
                      {question.question}
                    </p>
                  </div>
                </div>
                <div className="ml-11 space-y-2">
                  <div>
                    <p className="text-xs text-[#616f89] mb-1">Tu respuesta:</p>
                    <p
                      className={`text-sm font-medium ${
                        question.isCorrect ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {question.userAnswer}
                    </p>
                  </div>
                  {!question.isCorrect && (
                    <div>
                      <p className="text-xs text-[#616f89] mb-1">
                        Respuesta correcta:
                      </p>
                      <p className="text-sm font-medium text-green-700">
                        {question.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

