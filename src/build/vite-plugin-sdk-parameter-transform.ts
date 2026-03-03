import type { Plugin } from "vite";

/**
 * `<SDKParameter path="..." />` JSX를 빌드 타임에 직접 import + JSX로 변환하는 Vite 플러그인.
 *
 * MDX 컴파일 이전(`enforce: "pre"`)에 실행되어 원본 JSX 태그를 정적 import로 교체한다.
 * `.mdx`와 `.tsx` 파일 모두 처리 가능.
 */
export function sdkParameterTransform(): Plugin {
  return {
    name: "sdk-parameter-transform",
    enforce: "pre",
    transform: {
      filter: {
        id: /\.(mdx|tsx)(\?.*)?$/,
        code: /SDKParameter/,
      },
      handler(code, id) {
        const [path] = id.split("?");
        if (!path?.endsWith(".mdx") && !path?.endsWith(".tsx")) return;
        if (!code.includes("SDKParameter")) return;

        // SDKParameter import 문 제거
        const importPattern =
          /import\s*\{[^}]*\bSDKParameter\b[^}]*\}\s*from\s*["'][^"']*["'];?\n?/g;
        let result = code.replace(importPattern, "");

        // <SDKParameter ... /> 태그 파싱
        const tagPattern = /<SDKParameter\s+((?:[^>]|(?:>(?!\s)))*?)\s*\/>/g;
        const entries: {
          key: string;
          importPath: string;
          exportName: string;
        }[] = [];
        const keyMap = new Map<string, string>(); // "importPath::exportName" → alias

        result = result.replace(tagPattern, (_match, attrsStr: string) => {
          const path = extractAttr(attrsStr, "path");
          const mode = extractAttr(attrsStr, "mode");
          const ident = extractAttr(attrsStr, "ident");
          const hasOptional = /\boptional\b/.test(attrsStr);

          if (!path) return _match; // path가 없으면 변환하지 않음

          // path → import 경로 매핑: "#/resources/X" → "~/components/parameter/__generated__/X/index.ts"
          const resourcePath = path.replace(/^#\/resources\//, "");
          const importPath = `~/components/parameter/__generated__/${resourcePath}/index.ts`;

          // mode → export 이름 매핑
          const exportName = modeToExport(mode);

          const dedupeKey = `${importPath}::${exportName}`;
          let alias = keyMap.get(dedupeKey);
          if (!alias) {
            alias = `_SDKParam_${entries.length}`;
            keyMap.set(dedupeKey, alias);
            entries.push({ key: dedupeKey, importPath, exportName });
          }

          // 대체 JSX 생성
          const jsxAttrs: string[] = [];
          if (ident) jsxAttrs.push(`ident="${ident}"`);
          if (hasOptional) jsxAttrs.push("optional");

          const attrStr = jsxAttrs.length > 0 ? ` ${jsxAttrs.join(" ")}` : "";
          return `<${alias}${attrStr} />`;
        });

        if (entries.length === 0) return;

        // import 문 생성
        const imports = entries
          .map(({ importPath, exportName }, i) => {
            const alias = `_SDKParam_${i}`;
            return `import { ${exportName} as ${alias} } from "${importPath}";`;
          })
          .join("\n");

        // 파일 상단에 import 추가 (기존 import 블록 뒤에)
        const lastImportIdx = findLastImportIndex(result);
        if (lastImportIdx !== -1) {
          const insertPos = result.indexOf("\n", lastImportIdx);
          if (insertPos !== -1) {
            result =
              result.slice(0, insertPos + 1) +
              imports +
              "\n" +
              result.slice(insertPos + 1);
          } else {
            result = result + "\n" + imports + "\n";
          }
        } else {
          result = imports + "\n" + result;
        }

        return { code: result, map: null };
      },
    },
  };
}

function extractAttr(attrs: string, name: string): string | undefined {
  const pattern = new RegExp(`${name}=["']([^"']*)["']`);
  const match = pattern.exec(attrs);
  return match?.[1];
}

function modeToExport(mode: string | undefined): string {
  if (!mode || mode === "full") return "TypeDef";
  if (mode === "details-only") return "Details";
  return "Type";
}

function findLastImportIndex(code: string): number {
  let lastIdx = -1;
  const importPattern = /^import\s/gm;
  let match: RegExpExecArray | null;
  while ((match = importPattern.exec(code)) !== null) {
    lastIdx = match.index;
  }
  return lastIdx;
}
