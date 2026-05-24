import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const noFetchApiRoutes = {
  rules: {
    "no-fetch-api-routes": {
      create(context) {
        return {
          Literal(node) {
            if (
              typeof node.value === "string" &&
              node.value.startsWith("/api/")
            ) {
              context.report({
                node,
                message:
                  "Don't use fetch('/api/...') — use a server action instead ('use server').",
              });
            }
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { local: noFetchApiRoutes },
    rules: {
      "local/no-fetch-api-routes": "error",
    },
    files: ["src/**/*.{ts,tsx}"],
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;