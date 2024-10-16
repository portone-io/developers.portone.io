import type { Lang } from "~/type";

export const indexFilesMapping = {
  ko: {
    docs: {
      "원 페이먼트 인프라": "opi/ko/",
      "파트너 정산 자동화": "platform/",
      "릴리즈 노트": "release-notes/(note)/",
    },
    blog: {
      "기술 블로그": "blog/",
    },
  },
  en: {
    docs: { "docs-en": "docs/en/" },
  },
} as const satisfies Record<Lang, Record<string, Record<string, string>>>;
