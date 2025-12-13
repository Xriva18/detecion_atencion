"use client";

import { useState } from "react";
import VideoCanvas from "@/src/components/Camera/VideoCanvas";
import BlinkCounter from "@/src/components/Parapadeo/BlinkCounter";
import { useCamera } from "@/src/hooks/useCamera";

export default function Home() {
  const { stream, isLoading, error } = useCamera();
  const [blinkCount] = useState(0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center py-8 px-4 bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-8">
          {isLoading && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              Cargando cámara...
            </p>
          )}

          {error && (
            <div className="text-center">
              <p className="text-lg text-red-600 dark:text-red-400 mb-2">
                Error: {error}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Por favor, permite el acceso a la cámara
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <VideoCanvas stream={stream} width={640} height={480} />
              <BlinkCounter count={blinkCount} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
