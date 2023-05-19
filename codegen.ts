import * as dotenv from "dotenv";
import type { CodegenConfig } from "@graphql-codegen/cli";

dotenv.config({ path: ".env.local" });

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      "https://api.github.com/graphql": {
        headers: {
          "User-Agent": "graphql-codegen",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      },
    },
  ],
  documents: ["src/**/*.graphql"],
  generates: {
    "src/__generated__/githubClient.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-graphql-request",
      ],
    },
  },
  config: {
    scalars: {
      URI: "string",
    },
    gqlImport: "graphql-request#gql",
    useTypeImports: true,
  },
};

export default config;
