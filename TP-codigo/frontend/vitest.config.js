import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    // Simula un navegador (DOM) para poder renderizar componentes React
    environment: "jsdom",
    // Se ejecuta una vez antes de los tests (matchers de jest-dom + limpieza)
    setupFiles: ["./tests/setup.js"],
    // Dónde buscar los tests unitarios
    include: ["tests/unitario/**/*.test.{js,jsx}"],
  },
});
