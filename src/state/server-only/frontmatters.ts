import { signal } from "@preact/signals";

/**
 * `~/pages/docs/[lang]/[...slug].astro` 에서 내용이 채워집니다.\
 * key에는 컨텐츠 slug가, value에는 컨텐츠 frontmatter가 들어갑니다.
 */
export const frontmattersSignal = signal<Frontmatters>({});
export type Frontmatters = Record<string, any>;
