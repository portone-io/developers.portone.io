import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import yaml from "js-yaml";
import type { Literal, Root } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

import { generateSlug as originalGenerateSlug } from "../../src/utils/slugs";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

// Frontmatter 타입 정의
export type Frontmatter = {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
  targetVersions?: string[];
  [key: string]: unknown; // 기타 알려지지 않은 필드를 위한 인덱스 시그니처
};

// MDX 파싱 결과 타입
export type MdxParseResult = {
  filePath: string;
  slug: string;
  frontmatter: Frontmatter;
  imports: {
    source: string;
    specifiers: {
      name: string;
      isDefault: boolean;
      alias?: string;
    }[];
  }[];
  ast: Root; // unified AST
  content: string; // 원본 MDX 내용
};

/**
 * MDX 파일을 파싱하여 frontmatter, slug, 파일 경로, imports, AST를 추출하는 함수
 * @param filePath MDX 파일 경로 (프로젝트 루트 기준 상대 경로)
 * @returns 파싱 결과
 */
export async function parseMdxFile(filePath: string): Promise<MdxParseResult> {
  // 파일 내용 읽기
  const content = await readFile(join(rootDir, filePath), "utf-8");

  // 파싱 결과 초기화
  const result: MdxParseResult = {
    filePath,
    slug: generateSlug(filePath),
    frontmatter: {},
    imports: [],
    ast: null as unknown as Root,
    content,
  };

  // unified 파이프라인 설정
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkFrontmatter, ["yaml"])
    .use(remarkGfm)
    .use(() => (tree) => {
      // AST 저장
      result.ast = tree as Root;

      // 프론트매터 추출
      visit(tree, "yaml", (node: Literal) => {
        try {
          const parsedFrontmatter = yaml.load(node.value);

          // 프론트매터가 존재하는 경우에만 할당
          if (parsedFrontmatter && typeof parsedFrontmatter === "object") {
            result.frontmatter = parsedFrontmatter as Frontmatter;
          } else {
            console.warn(
              `${filePath}의 프론트매터가 비어있거나 객체가 아닙니다.`,
            );
            // 빈 객체로 초기화
            result.frontmatter = {};
          }
        } catch (e) {
          console.error(`${filePath}의 프론트매터 파싱 중 오류 발생:`, e);
          // 오류 발생 시 빈 객체로 초기화
          result.frontmatter = {};
        }
      });

      // 임포트 구문 추출
      visit(tree, "mdxjsEsm", (node: Literal) => {
        const value = node.value;

        // import 구문 분석
        if (value.startsWith("import")) {
          const importMatch = value.match(
            /import\s+(?:(?:(\w+)|{([^}]*)})(?:\s*,\s*(?:(\w+)|{([^}]*)}))?)?\s+from\s+['"]([^'"]+)['"]/,
          );

          if (importMatch) {
            const [
              _,
              defaultImport,
              namedImports1,
              defaultImport2,
              namedImports2,
              source,
            ] = importMatch;

            const importInfo = {
              source: source || "",
              specifiers: [] as {
                name: string;
                isDefault: boolean;
                alias?: string;
              }[],
            };

            // 기본 임포트 처리
            if (defaultImport) {
              importInfo.specifiers.push({
                name: defaultImport,
                isDefault: true,
              });
            }

            // 명명된 임포트 처리
            if (namedImports1) {
              const specifiers = namedImports1.split(",").map((s) => s.trim());
              for (const specifier of specifiers) {
                const aliasMatch = specifier.match(/(\w+)\s+as\s+(\w+)/);
                if (aliasMatch && aliasMatch[1] && aliasMatch[2]) {
                  importInfo.specifiers.push({
                    name: aliasMatch[1],
                    isDefault: false,
                    alias: aliasMatch[2],
                  });
                } else {
                  importInfo.specifiers.push({
                    name: specifier,
                    isDefault: false,
                  });
                }
              }
            }

            // 두 번째 기본 임포트 처리 (드문 경우)
            if (defaultImport2) {
              importInfo.specifiers.push({
                name: defaultImport2,
                isDefault: true,
              });
            }

            // 두 번째 명명된 임포트 처리
            if (namedImports2) {
              const specifiers = namedImports2.split(",").map((s) => s.trim());
              for (const specifier of specifiers) {
                const aliasMatch = specifier.match(/(\w+)\s+as\s+(\w+)/);
                if (aliasMatch && aliasMatch[1] && aliasMatch[2]) {
                  importInfo.specifiers.push({
                    name: aliasMatch[1],
                    isDefault: false,
                    alias: aliasMatch[2],
                  });
                } else {
                  importInfo.specifiers.push({
                    name: specifier,
                    isDefault: false,
                  });
                }
              }
            }

            result.imports.push(importInfo);
          }
        }
      });
    });

  // MDX 파싱 실행
  const file = processor.parse(content);
  await processor.run(file);
  result.ast = file;

  return result;
}

/**
 * 파일 경로에서 슬러그 생성
 * @param filePath 파일 경로
 * @returns 슬러그
 */
function generateSlug(filePath: string): string {
  const basePath = "src/routes/(root)";

  // utils/slugs.ts의 generateSlug 함수 사용
  let slug = originalGenerateSlug(filePath, basePath);

  // 슬러그가 /로 시작하면 제거
  if (slug.startsWith("/")) {
    slug = slug.substring(1);
  }

  return slug;
}
