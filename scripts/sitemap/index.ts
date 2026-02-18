import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { collectRoutes } from "./collectRoutes.ts";
import { generateSitemap } from "./generateSitemap.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "../..");
const outputDir = join(rootDir, "public");

async function main() {
  try {
    console.log("sitemap.xml을 생성합니다...");

    const urls = await collectRoutes();
    console.log(`총 ${urls.length}개의 URL을 수집했습니다.`);

    const { indexXml, sitemaps } = generateSitemap(urls);

    await Promise.all([
      // sitemap index가 필요한 경우
      indexXml &&
        writeFile(join(outputDir, "sitemap.xml"), indexXml, "utf-8").then(() =>
          console.log("sitemap.xml (index) 파일을 생성했습니다."),
        ),
      // 개별 sitemap 파일 저장
      ...sitemaps.map(({ filename, xml }) =>
        writeFile(join(outputDir, filename), xml, "utf-8").then(() =>
          console.log(`${filename} 파일을 생성했습니다.`),
        ),
      ),
    ]);

    console.log("sitemap 생성이 완료되었습니다.");
  } catch (error) {
    console.error("sitemap 생성 중 오류 발생:", error);
    process.exit(1);
  }
}

main();
