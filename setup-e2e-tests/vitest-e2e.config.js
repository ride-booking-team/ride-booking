import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    test: {
        root: path.resolve(import.meta.dirname, ".."),

        include: ["**/*.e2e-spec.ts"],
        environment: "node",

        // Une seule base Postgres pour tous les fichiers : on les lance un par un.
        fileParallelism: false,

        // Laisse le temps à Docker de démarrer Postgres.
        hookTimeout: 120_000,
    },
});
