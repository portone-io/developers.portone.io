/**
 * Generates a consistent slug from a file path
 * genCollections.ts의 로직과 동일하게 구현
 *
 * @param filePath The absolute or relative file path
 * @param basePath Base path to strip (e.g., 'src/routes/(root)/opi')
 * @returns Normalized slug
 */
export function generateSlug(filePath: string, basePath: string): string {
  // genCollections.ts와 동일한 정규식 패턴 사용
  const slugRegex = new RegExp(
    `^${basePath
      .replaceAll(/\(/g, "\\(")
      .replaceAll(/\)/g, "\\)")}/([\\s\\S]+)\\.mdx$`,
  );

  // 정규식으로 슬러그 추출
  const slug = slugRegex.exec(filePath)?.[1]?.replace(/\/index$/, "") ?? "";

  return slug;
}
