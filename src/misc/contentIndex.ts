import type { config } from "~/content/config";
import type { Lang } from "~/type";

export const indexFilesMapping = {
  ko: {
    "원 페이먼트 인프라": "opi",
    "파트너 정산 자동화": "platform",
    "릴리즈 노트": "releaseNotes",
    "API & SDK": "sdk",
  },
  blog: {
    "기술 블로그": "blog",
  },
} as const satisfies Record<Lang | "blog", Record<string, keyof typeof config>>;

export type IndexFilesMapping = typeof indexFilesMapping;
