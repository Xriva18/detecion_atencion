"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Admin/Header";
import api from "@/services/api";

export default function CuestionarioPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/sessions/quiz/${quizId}`);
        if (res.data && res.data.content) {
          setQuestions(res.data.content);
        } else {
          setError("No se encontraron preguntas para este cuestionario.");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setError("Error cargando el cuestionario.");
      } finally {
        setLoading(false);
      }
    };
    if (quizId) fetchQuiz();
  }, [quizId]);

  const handleAnswerSelect = (index: number, answer: string) => {
    // Usamos el índice como key temporal, idealmente el objeto pregunta tendría ID único
    setAnswers({ ...answers, [`q${index}`]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    try {
      await api.post('/sessions/quiz/submit', {
        quiz_id: quizId,
        answers: answers
      });

      // Redirigir a resultados (o dashboard por ahora)
      setTimeout(() => {
        // TODO: Crear página de resultados /estudiante/resultados/[quizId]
        // Por ahora volvemos a la lista de clases
        alert("¡Cuestionario enviado! Tu nota ha sido registrada.");
        router.push("/estudiante/dashboard");
      }, 1500);

    } catch (err) {
      console.error("Error submitting quiz:", err);
      alert("Hubo un error enviando tus respuestas.");
      setIsSubmitted(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Cargando cuestionario...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (questions.length === 0) return <div className="p-10 text-center">No hay preguntas disponibles.</div>;

  const currentQ = questions[currentQuestion];
  // Adaptar estructura si viene del backend diferente
  // Backend esperado: { question: "...", options: ["..."], correct_answer: "..." }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  // Verificar si la respuesta actual está seleccionada (usando índice q{i})
  const currentAnswer = answers[`q${currentQuestion}`];
  const allAnswered = Object.keys(answers).length === questions.length;

  if (isSubmitted) {
    return (
      <>
        <Header
          title="Cuestionario"
          subtitle="Procesando tus respuestas"
          user={{
            name: "Estudiante",
            email: "estudiante@demo.com",
            role: "Estudiante",
          }}
        />
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8 items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-medium text-[#111318]">
              Enviando respuestas...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Cuestionario Personalizado"
        subtitle={`Pregunta ${currentQuestion + 1} de ${questions.length}`}
        user={{
          name: "Estudiante",
          email: "estudiante@demo.com",
          role: "Estudiante",
        }}
      />
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#111318]">
              Progreso: {currentQuestion + 1} / {questions.length}
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
            {currentQ.options && currentQ.options.map((option: string, index: number) => {
              const isSelected = currentAnswer === option;
              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, option)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${isSelected
                    ? "border-primary bg-primary/5"
                    : "border-[#e5e7eb] hover:border-primary/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${isSelected
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
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!currentAnswer}
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

