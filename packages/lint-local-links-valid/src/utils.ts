import path from "node:path";

export function isLocalLink(url: string): boolean {
  try {
    new URL(url);
  } catch {
    return true;
  }
  return false;
}

export function resolveRedirect(
  redirects: Map<string, string>,
  url: string,
): string {
  let resolved = url;
  const visited = new Set<string>();
  while (redirects.has(resolved)) {
    if (visited.has(resolved)) {
      throw new Error("리다이렉트 사이클이 발생했습니다.");
    }
    visited.add(resolved);
    resolved = redirects.get(resolved)?.split(/[#?]/)[0] ?? resolved;
  }
  return resolved;
}

export function resolvePathname(filePath: string): string {
  return (
    "/" +
    filePath
      .replace(/\.(?:(?:[cm]?[jt]sx?)|(?:mdx?))$/, "")
      .replaceAll(/(^|\/)\(.+?\)($|\/)/g, "/")
      .replace(/\/(?:index)?$/, "")
  );
}

export function isFileExists(
  pathname: string,
  excludePaths: string[],
  files: Set<string>,
  message: (reason: string) => void,
): void {
  if (!isLocalLink(pathname)) return;
  if (excludePaths.some((p) => pathname.startsWith(p))) return;
  if (path.extname(pathname) !== "") {
    message("로컬 링크는 확장자를 가질 수 없습니다.");
    return;
  }
  if (!files.has(pathname)) {
    message(`파일을 찾을 수 없습니다: ${pathname}`);
  }
}
