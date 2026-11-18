import path from "node:path";

import FastGlob from "fast-glob";
import * as YAML from "yaml";

import {
  isFileExists,
  isLocalLink,
  resolvePathname,
  resolveRedirect,
} from "../utils.ts";
import type { YamlRule } from "./index.ts";

const MESSAGES = {
  invalidKey: "Pair 키는 'old' 또는 'new' 이어야 합니다.",
  invalidValue: "링크는 문자열이어야 합니다.",
  invalidOldLink: "'old' 링크는 '/' 로 시작해야 합니다.",
  invalidNewLink: "'new' 링크는 '/' 없이 사이트 루트 기준으로 적어야 합니다.",
  externalNewLink: "'new' 링크는 외부 URL일 수 없습니다.",
  missingOldLink: "'old' 링크를 찾을 수 없습니다.",
  missingNewLink: "'new' 링크를 찾을 수 없습니다.",
  duplicateRedirect: "리다이렉트가 중복되었습니다.",
  redirectCycle: "리다이렉트 사이클이 발생했습니다.",
};

/** 파일이 아닌 catch-all 라우트로 제공되는 경로 (예: `api/rest-v1/[...slug].tsx`) */
const EXCLUDE_PATHS = ["/api/"];

const stripQuery = (link: string) => link.split(/[#?]/)[0] ?? "";

const isStringScalar = (node: unknown): node is YAML.Scalar<string> =>
  YAML.isScalar(node) && typeof node.value === "string";

/**
 * `_redir.yaml`의 리다이렉트를 검사합니다.
 *
 * `<root>/docs/_redir.yaml`은 `/docs<old>` 경로로 들어온 요청을 `/<new>`로
 * 리다이렉트합니다(`docs/[...redirect].tsx` 참고). 따라서 `old`는 `/`로
 * 시작해야 하고, `new`는 `/` 없이 사이트 루트 기준 경로로 적어야 합니다.
 * `new`가 다른 리다이렉트를 가리키면 끝까지 따라가서 문서가 있는지 확인합니다.
 */
export const rule: YamlRule = ({ filePath, doc, report }) => {
  const { name, dir } = path.parse(filePath);
  if (name !== "_redir" || !YAML.isSeq(doc.contents)) return;

  const rootDir = path.resolve(dir, "..");
  const fromPrefix = resolvePathname(path.relative(rootDir, dir));
  const files = new Set(
    FastGlob.sync("**/*", { cwd: rootDir }).map(resolvePathname),
  );
  const redirects = new Map<string, string>();
  const targets: { to: string; node: YAML.Scalar }[] = [];

  for (const item of doc.contents.items) {
    if (!YAML.isMap(item)) continue;

    let from: YAML.Scalar<string> | undefined;
    let to: YAML.Scalar<string> | undefined;
    for (const { key, value } of item.items) {
      const keyName = YAML.isScalar(key) ? String(key.value) : null;
      if (keyName !== "old" && keyName !== "new") {
        report(YAML.isNode(key) ? key : item, MESSAGES.invalidKey);
        continue;
      }
      if (!isStringScalar(value)) {
        report(YAML.isNode(value) ? value : item, MESSAGES.invalidValue);
        continue;
      }
      if (keyName === "old") from = value;
      else to = value;
    }

    if (!from) report(item, MESSAGES.missingOldLink);
    if (!to) report(item, MESSAGES.missingNewLink);
    if (!from || !to) continue;

    if (!from.value.startsWith("/")) {
      report(from, MESSAGES.invalidOldLink);
      continue;
    }
    if (!isLocalLink(to.value)) {
      report(to, MESSAGES.externalNewLink);
      continue;
    }
    if (to.value.startsWith("/")) {
      report(to, MESSAGES.invalidNewLink);
      continue;
    }

    const fromPath = fromPrefix + stripQuery(from.value);
    const toPath = `/${stripQuery(to.value)}`;
    if (redirects.has(fromPath)) report(item, MESSAGES.duplicateRedirect);
    redirects.set(fromPath, toPath);
    targets.push({ to: toPath, node: to });
  }

  for (const { to, node } of targets) {
    let resolved: string;
    try {
      resolved = resolveRedirect(redirects, to);
    } catch {
      report(node, MESSAGES.redirectCycle);
      continue;
    }
    isFileExists(resolved, EXCLUDE_PATHS, files, (reason) =>
      report(node, reason),
    );
  }
};
