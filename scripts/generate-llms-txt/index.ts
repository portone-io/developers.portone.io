import {
  convertAllMdxToMarkdown,
  generateLlmsTxtFiles,
} from "./mdx-to-markdown";

/**
 * llms.txt 생성 메인 함수
 */
async function main() {
  try {
    console.log(
      "MDX 파일을 마크다운으로 변환하고 llms.txt 파일을 생성합니다...",
    );

    // MDX 파일을 마크다운으로 변환
    await convertAllMdxToMarkdown();

    // llms.txt, llms-full.txt, llms-small.txt 파일 생성
    await generateLlmsTxtFiles();

    console.log("모든 작업이 완료되었습니다.");
  } catch (error) {
    console.error("오류 발생:", error);
    process.exit(1);
  }
}

// 스크립트 실행
main();
