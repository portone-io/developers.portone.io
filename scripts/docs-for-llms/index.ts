import type { MdxParseResult } from "../mdx-to-markdown/mdx-parser.ts";
import {
  parseAllMdxFiles,
  transformAllMdxsToAsts,
} from "../mdx-to-markdown/utils.ts";
import { generateDocsForLlms } from "./generator.ts";

/**
 * 메인 함수
 * MDX 파일을 파싱하고, 마크다운 AST로 변환한 후, docs-for-llms 디렉토리에 마크다운 파일들을 생성
 */
export async function main() {
  try {
    console.log(
      "MDX 파일을 마크다운으로 변환하고 docs-for-llms 디렉토리를 생성합니다...",
    );

    // MDX 파일 파싱
    const fileParseMap: Record<string, MdxParseResult> =
      await parseAllMdxFiles();

    // MDX 파일을 마크다운 AST로 변환 (웹페이지 링크 사용)
    const transformedAstMap = transformAllMdxsToAsts(fileParseMap, false);

    // 변환된 AST를 재사용하여 docs-for-llms 디렉토리 생성
    const docsForLlmsPath = await generateDocsForLlms(
      fileParseMap,
      transformedAstMap,
    );

    console.log(`작업이 완료되었습니다. 생성된 디렉토리: ${docsForLlmsPath}`);
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
