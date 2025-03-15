import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";

import { type MdxParseResult } from "../../mdx-parser";
import { handleApiLinkComponent } from "./apiLink";
import { handleBadgeComponent } from "./badge";
import { extractCodeContent } from "./code";
import { extractMdxJsxAttributes } from "./common";
import { handleContentRefComponent } from "./contentRef";
import { handleDetailsComponent } from "./details";
import { handleFigureComponent } from "./figure";
import { handleHintComponent } from "./hint";
import { handleProseComponent } from "./prose";
import {
  handleSwaggerComponent,
  handleSwaggerDescriptionComponent,
  handleSwaggerResponseComponent,
} from "./swagger";
import { handleTabsComponent } from "./tabs";
import { handleVersionGateComponent } from "./versionGate";
import { handleYoutubeComponent } from "./youtube";

/**
 * JSX 컴포넌트를 마크다운으로 변환하는 함수
 * @param ast MDX AST
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 */
export function transformJsxComponents(
  ast: Node,
  parseResultMap: Record<string, MdxParseResult>,
): void {
  // 제거할 노드 인덱스 목록
  const nodesToRemove: Array<{ parent: Parent; index: number }> = [];

  // JSX 컴포넌트 변환
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: Node, index: number | undefined, parent: Parent | undefined) => {
      // Type assertion to handle the specific node types we expect
      const jsxNode = node as MdxJsxFlowElement | MdxJsxTextElement;
      if (!jsxNode.name || index === undefined || !parent) return;

      // prose 태그 처리 (예: <prose.h1>, <prose.p> 등)
      if (jsxNode.name.startsWith("prose.")) {
        const proseElementType = jsxNode.name.split(".")[1];
        if (proseElementType) {
          // 노드 교체 - 배열에서 직접 교체
          parent.children.splice(
            index,
            1,
            handleProseComponent(jsxNode, proseElementType),
          );
          return;
        }
      }

      // code 요소인지 확인
      if (jsxNode.name === "code") {
        // 코드 내용 추출 및 백틱으로 감싼 텍스트 노드 생성
        const backtickNode = extractCodeContent(jsxNode);

        // 원래 노드를 백틱 노드로 교체
        parent.children.splice(index, 1, backtickNode);
        return;
      }

      // 일반 컴포넌트 처리 (대문자로 시작하는 컴포넌트)
      if (!/^[A-Z]/.test(jsxNode.name)) return;

      // 컴포넌트 이름과 속성
      const componentName = jsxNode.name;

      // 속성 추출
      const props = extractMdxJsxAttributes(jsxNode);

      let replacementNode: Node | null = null;
      switch (componentName) {
        case "Figure":
          replacementNode = handleFigureComponent(props);
          break;
        case "Hint":
          replacementNode = handleHintComponent(jsxNode, props);
          break;
        case "Tabs":
          replacementNode = handleTabsComponent(jsxNode);
          break;
        case "Details":
          replacementNode = handleDetailsComponent(jsxNode);
          break;
        case "ContentRef":
          replacementNode = handleContentRefComponent(props, parseResultMap);
          break;
        case "VersionGate":
          replacementNode = handleVersionGateComponent(jsxNode, props);
          break;
        case "Youtube":
          replacementNode = handleYoutubeComponent(props);
          break;
        case "ApiLink":
          replacementNode = handleApiLinkComponent(props);
          break;
        case "PaymentV1":
        case "PaymentV2":
        case "Recon":
        case "Console":
        case "Partner":
          replacementNode = handleBadgeComponent(componentName);
          break;
        case "Swagger":
          replacementNode = handleSwaggerComponent(jsxNode, props);
          break;
        case "SwaggerDescription":
          replacementNode = handleSwaggerDescriptionComponent(jsxNode, props);
          break;
        case "SwaggerResponse":
          replacementNode = handleSwaggerResponseComponent(jsxNode, props);
          break;
        default:
          // 기본적으로 자식 노드만 유지
          replacementNode = {
            type: "root",
            children: jsxNode.children || [],
          } as Parent;
      }

      if (replacementNode) {
        // 노드 교체
        parent.children.splice(index, 1, replacementNode);
      } else {
        // 교체 노드가 없으면 제거 목록에 추가
        nodesToRemove.push({ parent, index });
      }
    },
  );

  // 제거할 노드 처리 (역순으로 제거하여 인덱스 변화 방지)
  for (let i = nodesToRemove.length - 1; i >= 0; i--) {
    const item = nodesToRemove[i];
    if (item && item.parent && Array.isArray(item.parent.children)) {
      item.parent.children.splice(item.index, 1);
    }
  }
}
