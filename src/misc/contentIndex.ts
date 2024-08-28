export const indexFilesMapping = {
  blog: "blog/",
  "opi-ko": "opi/ko/",
  "release-notes": "release-notes/(note)/",
} as const satisfies Record<string, string>;
export type IndexFileName = keyof typeof indexFilesMapping;
