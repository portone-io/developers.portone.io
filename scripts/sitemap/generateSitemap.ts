import { XMLBuilder } from "fast-xml-parser";

const SITE_URL = "https://developers.portone.io";
const MAX_URLS_PER_SITEMAP = 50_000;

/**
 * URL 목록에서 sitemap XML 문자열을 생성
 */
function buildUrlsetXml(urls: string[]): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true,
    format: true,
  });

  const root = {
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    urlset: {
      "@_xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      url: urls.map((path) => ({
        loc: `${SITE_URL}${path}`,
        changefreq: "daily",
        priority: 0.5,
      })),
    },
  };

  return builder.build(root);
}

/**
 * sitemap index XML 문자열을 생성
 */
function buildSitemapIndexXml(sitemapCount: number): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true,
    format: true,
  });

  const sitemaps = Array.from({ length: sitemapCount }, (_, i) => ({
    loc: `${SITE_URL}/sitemap-${i}.xml`,
  }));

  const root = {
    "?xml": { "@_version": "1.0", "@_encoding": "UTF-8" },
    sitemapindex: {
      "@_xmlns": "http://www.sitemaps.org/schemas/sitemap/0.9",
      sitemap: sitemaps,
    },
  };

  return builder.build(root);
}

export type SitemapOutput = {
  /** sitemap index가 필요한 경우 sitemap.xml에 쓸 index XML */
  indexXml?: string;
  /** 개별 sitemap 파일들 (단일인 경우 sitemap.xml, 분할인 경우 sitemap-0.xml, sitemap-1.xml, ...) */
  sitemaps: { filename: string; xml: string }[];
};

/**
 * URL 목록에서 sitemap XML 파일들을 생성
 * 50,000개 초과 시 분할 + sitemap index 생성
 */
export function generateSitemap(urls: string[]): SitemapOutput {
  if (urls.length <= MAX_URLS_PER_SITEMAP) {
    return {
      sitemaps: [{ filename: "sitemap.xml", xml: buildUrlsetXml(urls) }],
    };
  }

  // 분할 필요
  const chunks: string[][] = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_SITEMAP) {
    chunks.push(urls.slice(i, i + MAX_URLS_PER_SITEMAP));
  }

  return {
    indexXml: buildSitemapIndexXml(chunks.length),
    sitemaps: chunks.map((chunk, i) => ({
      filename: `sitemap-${i}.xml`,
      xml: buildUrlsetXml(chunk),
    })),
  };
}
