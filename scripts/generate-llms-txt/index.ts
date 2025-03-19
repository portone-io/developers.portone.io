import {
  copySchemaFiles,
  generateLlmsTxtFiles,
  parseAllMdxFiles,
  saveMarkdownFiles,
  transformAllMdxToAst,
} from "./generator";
import type { MdxParseResult } from "./mdx-parser";

/**
 * 메인 함수
 * MDX 파일을 파싱하고, 마크다운 AST로 변환한 후, 마크다운 파일과 llms.txt 파일을 생성
 */
export async function main() {
  try {
    console.log(
      "MDX 파일을 마크다운으로 변환하고 llms.txt 파일을 생성합니다...",
    );

    // MDX 파일 파싱
    const fileParseMap: Record<string, MdxParseResult> =
      await parseAllMdxFiles();

    // MDX 파일을 마크다운 AST로 변환
    const transformedAstMap = transformAllMdxToAst(fileParseMap);

    // 변환된 AST를 마크다운 파일로 저장
    await saveMarkdownFiles(fileParseMap, transformedAstMap);

    // 변환된 AST를 재사용하여 llms.txt 파일 생성
    const llmsTxtPath = await generateLlmsTxtFiles(
      fileParseMap,
      transformedAstMap,
    );

    // src/schema 디렉토리의 모든 파일을 public/schema 디렉토리로 복사
    const copiedSchemaFiles = await copySchemaFiles();

    console.log(`작업이 완료되었습니다. 생성된 파일: ${llmsTxtPath}`);
    console.log(`복사된 스키마 파일: ${copiedSchemaFiles.length}개`);
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
