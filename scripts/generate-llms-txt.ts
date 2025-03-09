import * as fs from "node:fs/promises";
import path from "node:path";

import { toString } from "mdast-util-to-string";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";
import remarkParse from "remark-parse";
import { unified } from "unified";
import jsYaml from "js-yaml";
import { visit } from "unist-util-visit";

// 마크다운 파일 저장 디렉토리
const MARKDOWN_OUTPUT_DIR = path.join(process.cwd(), "public", "llms");
// 전체 콘텐츠를 합칠 파일들
const FULL_OUTPUT_PATH = path.join(MARKDOWN_OUTPUT_DIR, "llms-full.txt");
const SMALL_OUTPUT_PATH = path.join(MARKDOWN_OUTPUT_DIR, "llms-small.txt");

// MDX 파일에서 순수 마크다운으로 변환하는 함수
async function mdxToMarkdown(filePath: string): Promise<{
  markdown: string;
  title: string;
  description: string;
  slug: string;
}> {
  const fileContent = await fs.readFile(filePath, "utf-8");
  
  // 디버깅 정보
  console.log(`File size: ${fileContent.length} bytes`);
  
  // frontmatter 추출
  const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n/);
  const frontmatterText = frontmatterMatch?.[1] || "";
  
  console.log(`Frontmatter found: ${frontmatterText.length > 0 ? "yes" : "no"}`);
  
  let frontmatter: any = {};
  try {
    frontmatter = frontmatterText ? jsYaml.load(frontmatterText) : {};
    console.log(`Title from frontmatter: "${frontmatter.title || "none"}"`);
  } catch (e) {
    console.error(`Failed to parse frontmatter: ${e}`);
  }
  
  // MDX 컨텐츠 (frontmatter 이후 부분)
  const contentWithoutFrontmatter = fileContent.replace(/^---\n[\s\S]*?\n---\n/, "");
  console.log(`Content length without frontmatter: ${contentWithoutFrontmatter.length} bytes`);
  
  // 더 간단한 접근 방식 - 먼저 import 제거
  const contentWithoutImports = contentWithoutFrontmatter.replace(/import[^;]*;/g, "");
  
  // 커스텀 컴포넌트 간단 변환
  let processedContent = contentWithoutImports
    // Figure 컴포넌트 변환
    .replace(/<Figure[^>]*?src=["']([^"']+)["'][^>]*?(?:alt=["']([^"']+)["'])?[^>]*?>\s*(?:<\/Figure>)?/g, '![$2]($1)')
    // Hint 컴포넌트 변환
    .replace(/<Hint[^>]*>([\s\S]*?)<\/Hint>/g, '> $1')
    // Tabs 컴포넌트 - 탭 제목 제거하고 내용만 유지
    .replace(/<Tabs[^>]*>([\s\S]*?)<\/Tabs>/g, '$1')
    .replace(/<Tab[^>]*?label=["'][^"']*["'][^>]*>([\s\S]*?)<\/Tab>/g, '$1')
    // 기타 커스텀 컴포넌트 제거
    .replace(/<[A-Z][a-zA-Z]*(?:\s+[^>]*)?\/>/g, '')
    .replace(/<[A-Z][a-zA-Z]*(?:\s+[^>]*)?>([\s\S]*?)<\/[A-Z][a-zA-Z]*>/g, '$1');
  
  // 정규식으로는 처리하기 어려운 경우를 위한 백업으로 unified 파서 사용
  let parsed;
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkGfm)
      .use(remarkFrontmatter)
      .use(function() {
        return function(tree) {
          // import 문 제거
          visit(tree, "mdxjsEsm", (node) => {
            node.value = "";
          });
          
          // JSX 컴포넌트를 일반 마크다운으로 변환
          visit(tree, "mdxJsxFlowElement", (node) => {
            if (node.name === "Figure") {
              const imgNode = node.children.find(child => 
                child.type === "mdxJsxFlowElement" && child.name === "img"
              );
              
              if (imgNode && imgNode.attributes) {
                const srcAttr = imgNode.attributes.find(attr => 
                  attr.type === "mdxJsxAttribute" && attr.name === "src"
                );
                
                const altAttr = imgNode.attributes.find(attr => 
                  attr.type === "mdxJsxAttribute" && attr.name === "alt"
                );
                
                if (srcAttr && srcAttr.value) {
                  node.type = "paragraph";
                  node.children = [{
                    type: "text",
                    value: `![${altAttr?.value || ""}](${srcAttr.value})`,
                  }];
                }
              }
            } else if (node.name === "Hint") {
              node.type = "blockquote";
            } else if (node.name === "Tabs") {
              // 탭 내용 평평하게 풀기
              node.type = "root";
            } else {
              // 기타 커스텀 컴포넌트는 내용만 보존
              node.type = "root";
            }
          });
        };
      });

    parsed = await processor.parse(fileContent);
  } catch (error) {
    console.error(`Error parsing MDX with unified: ${error}`);
    parsed = { type: "root", children: [] };
  }
  
  // AST에서 텍스트 추출 시도
  let parsedText = "";
  try {
    parsedText = toString(parsed, { includeImageAlt: true });
    console.log(`AST parser extracted text length: ${parsedText.length}`);
  } catch (error) {
    console.error(`Failed to extract text from AST: ${error}`);
  }
  
  // 최종 마크다운 컨텐츠 결정 (정규식 처리 결과 또는 파서 결과)
  let finalMarkdown;
  
  try {
    if (processedContent && processedContent.length > parsedText.length) {
      console.log(`Using regex processed content (${processedContent.length} chars)`);
      finalMarkdown = processedContent;
    } else if (parsedText.length > 0) {
      console.log(`Using AST parsed content (${parsedText.length} chars)`);
      finalMarkdown = parsedText;
    } else {
      // 둘 다 실패한 경우 원본 컨텐츠 사용
      console.log(`Both methods failed, using raw content without frontmatter`);
      finalMarkdown = contentWithoutFrontmatter;
    }
  } catch (error) {
    console.error(`Error in AST parsing: ${error}`);
    // AST 파싱 실패 시 정규식 처리 결과 사용
    finalMarkdown = processedContent;
  }
  
  // 경로에서 슬러그 추출
  const cwd = process.cwd();
  const relPath = path.relative(cwd, filePath);
  const routePath = relPath.replace(/^src[\/\\]routes[\/\\]\(root\)[\/\\]/, "").replace(/\.mdx$/, "");
  const slug = routePath.replace(/[\/\\]index$/, "");
  
  // 최종 마크다운 생성 (제목, 설명 포함)
  const title = frontmatter.title || "";
  const description = frontmatter.description || "";
  const markdown = `# ${title}\n\n${description}\n\n${finalMarkdown}`;
  
  console.log(`Final markdown length: ${markdown.length} bytes for ${slug}`);
  
  return {
    markdown,
    title,
    description,
    slug,
  };
}

// 모든 MDX 파일 처리
async function processAllMdxFiles() {
  const cwd = process.cwd();
  
  // 콘텐츠 디렉토리 경로들 (절대 경로로 사용)
  const contentDirs = [
    path.join(cwd, "src/routes/(root)/opi"),
    path.join(cwd, "src/routes/(root)/platform"), 
    path.join(cwd, "src/routes/(root)/sdk"),
    path.join(cwd, "src/routes/(root)/blog/posts")
  ];
  
  // 모든 MDX 파일 찾기
  const allMdxFiles: string[] = [];
  for (const dir of contentDirs) {
    console.log(`Searching for MDX files in ${dir}...`);
    try {
      // fastGlob는 괄호 등의 특수문자를 이스케이프해야 함
      // 직접 fs.readdir을 사용하여 모든 MDX 파일 찾기
      const findMdxFiles = async (directory: string) => {
        const entries = await fs.readdir(directory, { withFileTypes: true });
        const files: string[] = [];
        
        for (const entry of entries) {
          const fullPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            // 재귀적으로 하위 디렉토리 검색
            files.push(...await findMdxFiles(fullPath));
          } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
            files.push(fullPath);
          }
        }
        
        return files;
      };
      
      const files = await findMdxFiles(dir);
      console.log(`Found ${files.length} files in ${dir}`);
      allMdxFiles.push(...files);
    } catch (error) {
      console.error(`Error searching for MDX files in ${dir}:`, error);
    }
  }
  
  console.log(`Total MDX files found: ${allMdxFiles.length}`);
  if (allMdxFiles.length === 0) {
    console.log("No MDX files found. Checking if directories exist...");
    for (const dir of contentDirs) {
      try {
        const stats = await fs.stat(dir);
        console.log(`Directory ${dir} exists: ${stats.isDirectory()}`);
      } catch (error) {
        console.log(`Directory ${dir} does not exist or cannot be accessed`);
      }
    }
  }
  
  // 출력 디렉토리 생성
  await fs.mkdir(MARKDOWN_OUTPUT_DIR, { recursive: true });
  
  // 개별 파일 및 전체 콘텐츠를 위한 배열
  const allMarkdownContent: string[] = [];
  const smallMarkdownContent: string[] = [];
  
  // 각 MDX 파일 처리
  let successCount = 0;
  let errorCount = 0;
  
  for (const file of allMdxFiles) {
    try {
      console.log(`Processing file: ${file}`);
      const { markdown, title, description, slug } = await mdxToMarkdown(file);
      
      if (!markdown || markdown.length < 20) {
        console.warn(`Generated markdown is too short for ${file}. Content: "${markdown}"`);
        errorCount++;
        continue;
      }
      
      // 개별 파일 저장 (URL 구조 유지)
      const outputDir = path.join(MARKDOWN_OUTPUT_DIR, slug);
      await fs.mkdir(outputDir, { recursive: true });
      
      // llms.txt 파일 생성
      const outputPath = path.join(outputDir, "llms.txt");
      await fs.writeFile(outputPath, markdown, "utf-8");
      console.log(`Created: ${outputPath}`);
      
      // 전체 콘텐츠에 추가
      allMarkdownContent.push(`## ${title} (/${slug})\n\n${markdown}\n\n---\n\n`);
      
      // 요약 콘텐츠에 추가 (제목과 설명만)
      smallMarkdownContent.push(`## ${title} (/${slug})\n\n${description}\n\n`);
      
      successCount++;
    } catch (error) {
      console.error(`Error processing file ${file}:`, error);
      errorCount++;
    }
  }
  
  console.log(`Processing complete: ${successCount} files succeeded, ${errorCount} files failed`);
  
  // 모든 콘텐츠를 하나의 파일로 저장
  await fs.writeFile(FULL_OUTPUT_PATH, allMarkdownContent.join("\n"), "utf-8");
  await fs.writeFile(SMALL_OUTPUT_PATH, smallMarkdownContent.join("\n"), "utf-8");
  
  console.log(`Generated LLMs files in ${MARKDOWN_OUTPUT_DIR}`);
  console.log(`Total pages processed: ${allMdxFiles.length}`);
}

// 스크립트 실행
processAllMdxFiles().catch(console.error);
