export const indexFilesMapping = {
  blog: "blog/",
  "docs-en": "docs/en/",
  "docs-ko": "docs/ko/",
  "release-notes": "release-notes/",
} as const satisfies Record<string, string>;
export type IndexFileName = keyof typeof indexFilesMapping;
