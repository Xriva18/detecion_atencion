import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-7xl flex-col items-center justify-center py-4 px-4 sm:py-8 sm:px-6 lg:px-8 bg-white dark:bg-black">
        <div className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-black dark:text-white mb-8">
            Sistema de Detección
          </h1>

          <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
            <Link
              href="/reconocimiento"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white font-semibold text-lg transition-colors shadow-md hover:shadow-lg min-w-[200px] text-center"
            >
              Reconocimiento
            </Link>

            <Link
              href="/parpadeo"
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-black dark:text-white font-semibold text-lg transition-colors shadow-md hover:shadow-lg min-w-[200px] text-center"
            >
              Mirada a la pantalla
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
