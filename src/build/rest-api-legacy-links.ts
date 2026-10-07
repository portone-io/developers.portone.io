import {
  type CategoryEndpointsPair,
  getEndpointRepr,
} from "../layouts/rest-api/schema-utils/endpoint.ts";
import { getOperation } from "../layouts/rest-api/schema-utils/operation.ts";

/**
 * operationId → 개발자센터 API 문서 링크
 *
 * e.g. `naverWithholdReturnProductOrder` → `/api/rest-v1/pg.naverpay#post%20%2Fpayments%2F%7Bimp_uid%7D%2Fnaver%2Fwithhold-return`
 */
export function buildOperationLinkMap(
  schema: unknown,
  endpointGroups: CategoryEndpointsPair[],
  basepath: string,
): Map<string, string> {
  const linkMap = new Map<string, string>();
  for (const { category, endpoints } of endpointGroups) {
    for (const endpoint of endpoints) {
      const { operationId } = getOperation(schema, endpoint);
      if (!operationId) continue;
      linkMap.set(
        operationId,
        `${basepath}/${category.id}#${encodeURIComponent(getEndpointRepr(endpoint))}`,
      );
    }
  }
  return linkMap;
}

const anchorPattern = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
const hrefPattern = /\bhref\s*=\s*(["'])(.*?)\1/i;
const legacyHrefPattern = /^\/#!\/[^/]+\/([^/?#]+)$/;

/**
 * 구 Swagger UI 링크(`/#!/{tag}/{operationId}`)를 현재 API 문서 링크로 바꿉니다.
 * 대응하는 operationId가 없으면 링크를 제거하고 텍스트만 남깁니다.
 */
export function rewriteLegacyApiLinksInHtml(
  html: string,
  linkMap: ReadonlyMap<string, string>,
): string {
  return html.replace(anchorPattern, (anchor, attrs: string, text: string) => {
    const href = hrefPattern.exec(attrs)?.[2];
    const operationId = href && legacyHrefPattern.exec(href)?.[1];
    if (!operationId) return anchor;
    const url = linkMap.get(operationId);
    return url ? `<a href="${url}">${text}</a>` : text;
  });
}

export function rewriteLegacyApiLinks(
  obj: unknown,
  linkMap: ReadonlyMap<string, string>,
): unknown {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => rewriteLegacyApiLinks(item, linkMap));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] =
      (key === "description" || key === "x-portone-description") &&
      typeof value === "string"
        ? rewriteLegacyApiLinksInHtml(value, linkMap)
        : rewriteLegacyApiLinks(value, linkMap);
  }
  return result;
}
