import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configuración para Docker - solo en producción
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
};

export default nextConfig;
