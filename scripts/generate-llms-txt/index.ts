import {
  convertAllMdxToMarkdown,
  generateLlmsTxtFiles,
  parseAllMdxFiles,
} from "./generator";

/**
 * 메인 함수
 */
export async function main() {
  try {
    console.log(
      "MDX 파일을 마크다운으로 변환하고 llms.txt 파일을 생성합니다...",
    );

    // MDX 파일 파싱
    const fileParseMap = await parseAllMdxFiles();

    // MDX 파일을 마크다운으로 변환
    await convertAllMdxToMarkdown(fileParseMap);

    // llms.txt 파일 생성
    const llmsTxtPath = await generateLlmsTxtFiles(fileParseMap);

    console.log(`작업이 완료되었습니다. 생성된 파일: ${llmsTxtPath}`);
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
