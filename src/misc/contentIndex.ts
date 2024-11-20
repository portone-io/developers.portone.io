import type { Lang } from "~/type";

export const indexFilesMapping = {
  ko: {
    "원 페이먼트 인프라": "opi/ko/",
    "파트너 정산 자동화": "platform/ko/",
    "릴리즈 노트": "release-notes/(note)/",
    "API & SDK": "sdk/ko/",
  },
  en: {
    docs: "docs/en/",
  },
  blog: {
    "기술 블로그": "blog/",
  },
} as const satisfies Record<Lang | "blog", Record<string, string>>;

export type IndexFilesMapping = typeof indexFilesMapping;
