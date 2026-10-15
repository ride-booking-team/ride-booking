import { defineConfig } from "vitest/config";
import path from "node:path";

try {
    process.loadEnvFile();
} catch {
    // Pas de .env : les tests qui appellent Google seront ignorés.
}

export default defineConfig({
    test: {
        root: path.resolve(import.meta.dirname, ".."),

        include: ["**/*.it-spec.ts"],
        environment: "node",

        fileParallelism: false,

        coverage: {
            include: ["**/*.ts"],
            exclude: ["**/*.it-spec.ts"],
        },

        alias: {
            "@": path.resolve(import.meta.dirname, ".."),
        },
    },
});