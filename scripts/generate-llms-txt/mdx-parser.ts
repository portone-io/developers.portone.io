import { readFile } from "node:fs/promises";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkMdx from "remark-mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import yaml from "js-yaml";

// 프로젝트 경로 설정
const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");

// MDX 파싱 결과 타입
export type MdxParseResult = {
  filePath: string;
  slug: string;
  frontmatter: Record<string, any>;
  imports: {
    source: string;
    specifiers: {
      name: string;
      isDefault: boolean;
      alias?: string;
    }[];
  }[];
  ast: any; // unified AST
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
    ast: null,
    content,
  };
  
  // unified 파이프라인 설정
  const processor = unified()
    .use(remarkParse)
    .use(remarkMdx)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(() => (tree) => {
      // AST 저장
      result.ast = tree;
      
      // 프론트매터 추출
      visit(tree, 'yaml', (node: any) => {
        try {
          result.frontmatter = yaml.load(node.value as string) || {};
        } catch (e) {
          console.warn(`${filePath}의 프론트매터 파싱 중 오류 발생:`, e);
        }
      });
      
      // 임포트 구문 추출
      visit(tree, 'mdxjsEsm', (node: any) => {
        const value = node.value as string;
        
        // import 구문 분석
        if (value.startsWith('import')) {
          const importMatch = value.match(/import\s+(?:(?:(\w+)|{([^}]*)})(?:\s*,\s*(?:(\w+)|{([^}]*)}))?)?\s+from\s+['"]([^'"]+)['"]/);
          
          if (importMatch) {
            const [_, defaultImport, namedImports1, defaultImport2, namedImports2, source] = importMatch;
            
            const importInfo = {
              source,
              specifiers: [] as { name: string; isDefault: boolean; alias?: string; }[],
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
              const specifiers = namedImports1.split(',').map(s => s.trim());
              for (const specifier of specifiers) {
                const aliasMatch = specifier.match(/(\w+)\s+as\s+(\w+)/);
                if (aliasMatch) {
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
              const specifiers = namedImports2.split(',').map(s => s.trim());
              for (const specifier of specifiers) {
                const aliasMatch = specifier.match(/(\w+)\s+as\s+(\w+)/);
                if (aliasMatch) {
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
  const file = await processor.parse(content);
  result.ast = file;
  
  return result;
}

/**
 * 임포트된 컴포넌트 정보를 추출하는 함수
 * @param parseResult MDX 파싱 결과
 * @returns 컴포넌트 이름과 소스 매핑
 */
export function extractImportedComponents(parseResult: MdxParseResult): Map<string, string> {
  const componentMap = new Map<string, string>();
  
  for (const importInfo of parseResult.imports) {
    for (const specifier of importInfo.specifiers) {
      const componentName = specifier.alias || specifier.name;
      componentMap.set(componentName, importInfo.source);
    }
  }
  
  return componentMap;
}

/**
 * MDX AST에서 사용된 JSX 컴포넌트 정보를 추출하는 함수
 * @param parseResult MDX 파싱 결과
 * @returns 컴포넌트 사용 정보 배열
 */
export function extractJsxComponents(parseResult: MdxParseResult): {
  name: string;
  props: Record<string, any>;
  children: any[];
  position: any;
}[] {
  const components: {
    name: string;
    props: Record<string, any>;
    children: any[];
    position: any;
  }[] = [];
  
  // JSX 컴포넌트 추출
  visit(parseResult.ast, ['mdxJsxFlowElement', 'mdxJsxTextElement'], (node: any) => {
    if (node.name && /^[A-Z]/.test(node.name)) {
      const props: Record<string, any> = {};
      
      // 속성 추출
      if (node.attributes && Array.isArray(node.attributes)) {
        for (const attr of node.attributes) {
          if (attr.type === 'mdxJsxAttribute' && attr.name) {
            // 문자열 값
            if (attr.value && typeof attr.value === 'string') {
              props[attr.name] = attr.value;
            }
            // 표현식 값
            else if (attr.value && attr.value.type === 'mdxJsxAttributeValueExpression') {
              props[attr.name] = attr.value.value;
            }
            // 불리언 속성
            else {
              props[attr.name] = true;
            }
          }
        }
      }
      
      components.push({
        name: node.name,
        props,
        children: node.children || [],
        position: node.position,
      });
    }
  });
  
  return components;
}

/**
 * 슬러그를 생성하는 함수
 * @param filePath 파일 경로
 * @returns 슬러그
 */
function generateSlug(filePath: string): string {
  // 파일 확장자 제거
  const withoutExtension = filePath.replace(/\.(mdx|md)$/, '');
  
  // content/ 또는 src/routes/ 접두사 제거
  const withoutPrefix = withoutExtension
    .replace(/^content\//, '')
    .replace(/^src\/routes\/\(root\)\//, '');
  
  // index 파일 처리
  const withoutIndex = withoutPrefix.replace(/\/index$/, '');
  
  return withoutIndex;
} 
