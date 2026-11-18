import path from "node:path";

import FastGlob from "fast-glob";
import * as YAML from "yaml";

import { isFileExists, isLocalLink, resolvePathname } from "../utils.ts";
import type { YamlRule } from "./index.ts";

const isPairWithKey = (node: unknown, key: string) =>
  YAML.isPair(node) && YAML.isScalar(node.key) && node.key.value === key;

/** `_nav.yaml` 파일에 정의되어 있는 markdown 파일 링크의 유효성을 검사합니다. */
export const rule: YamlRule = ({ filePath, doc, report }) => {
  const { name, dir } = path.parse(filePath);
  if (name !== "_nav") return;

  const baseDir = path.resolve(dir, "..");
  const files = new Set(
    FastGlob.sync("**/*", { cwd: baseDir }).map(resolvePathname),
  );
  YAML.visit(doc, {
    Scalar(key, node, ancestors) {
      if (key === "key" || typeof node.value !== "string") return;
      const parent = ancestors.at(-1);
      const isItem =
        YAML.isSeq(parent) && isPairWithKey(ancestors.at(-2), "items");
      const isSlug = isPairWithKey(parent, "slug");
      if (!isItem && !isSlug) return;
      if (!isLocalLink(node.value)) return;

      const url = node.value.split(/[#?]/)[0] ?? "";
      isFileExists(url, [], files, (reason) => report(node, reason));
    },
  });
};
