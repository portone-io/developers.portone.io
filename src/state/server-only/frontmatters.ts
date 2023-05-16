import { signal } from "@preact/signals";

/**
 * `gitbook/ContentRef` 컴포넌트에서 다른 문서의 정보를 얻기 위한 값입니다.
 * `~/pages/docs/[lang]/[...slug].astro` 에서 내용이 채워집니다.\
 * key에는 컨텐츠 slug가, value에는 컨텐츠 frontmatter가 들어갑니다.
 */
export const frontmattersSignal = signal<Frontmatters>({});
export type Frontmatters = Record<string, any>;
