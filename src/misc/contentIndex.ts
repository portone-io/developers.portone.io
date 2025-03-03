import type { Lang } from "~/type";

export const indexFilesMapping = {
  ko: {
    "/opi/ko/": "원 페이먼트 인프라",
    "/platform/ko/": "파트너 정산 자동화",
    "/release-notes/(note)/": "릴리즈 노트",
    "/sdk/ko/": "API & SDK",
  },
  blog: {
    "/blog/": "기술 블로그",
  },
} as const satisfies Record<Lang | "blog", Record<string, string>>;

export type IndexFilesMapping = typeof indexFilesMapping;
