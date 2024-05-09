import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

import type { Rule } from "eslint";
import type { RuleListener } from "eslint-plugin-yml/lib/types.ts";
import type { AST } from "yaml-eslint-parser";

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

export async function isMarkdownExists(
  mdPath: string,
  excludePaths: string[],
  message: (reason: string) => void,
): Promise<void> {
  if (!isLocalLink(mdPath)) {
    return;
  }
  if (excludePaths.some((p) => mdPath.startsWith(p))) {
    return;
  }
  if (path.extname(mdPath) !== "") {
    message("로컬 링크는 확장자를 가질 수 없습니다.");
    return;
  }
  await Promise.any(
    [".md", ".mdx"].map((ext) => fsPromises.access(mdPath + ext)),
  ).catch(() => {
    message(`파일을 찾을 수 없습니다: ${mdPath}`);
  });
}

export function isMarkdownExistsSync(
  mdPath: string,
  excludePaths: string[],
  message: (reason: string) => void,
): void {
  if (!isLocalLink(mdPath)) {
    return;
  }
  if (excludePaths.some((p) => mdPath.startsWith(p))) {
    return;
  }
  if (path.extname(mdPath) !== "") {
    message("로컬 링크는 확장자를 가질 수 없습니다.");
    return;
  }
  const exists = [".md", ".mdx"].some((ext) => fs.existsSync(mdPath + ext));
  if (!exists) {
    message(`파일을 찾을 수 없습니다: ${mdPath}`);
  }
}

export interface RuleModule {
  meta: Rule.RuleMetaData;
  create(context: Rule.RuleContext): RuleListener;
}

export function isYAMLDocument(
  node: AST.YAMLNode | null | undefined,
): node is AST.YAMLDocument {
  return node !== null && node !== undefined && node.type === "YAMLDocument";
}

export function isYAMLScalar(
  node: AST.YAMLNode | null | undefined,
): node is AST.YAMLScalar {
  return node !== null && node !== undefined && node.type === "YAMLScalar";
}

export function isYAMLPair(
  node: AST.YAMLNode | null | undefined,
): node is AST.YAMLPair {
  return node !== null && node !== undefined && node.type === "YAMLPair";
}

export function isYAMLSequence(
  node: AST.YAMLNode | null | undefined,
): node is AST.YAMLSequence {
  return node !== null && node !== undefined && node.type === "YAMLSequence";
}
