import { visit } from "unist-util-visit";

import { type MdxParseResult } from "../../mdx-parser";
import { handleBadgeComponent } from "./badge";
import { extractCodeContent } from "./code";
import { extractMdxJsxAttributes } from "./common";
import { handleContentRefComponent } from "./contentRef";
import { handleDetailsComponent } from "./details";
import { handleFigureComponent } from "./figure";
import { handleHintComponent } from "./hint";
import { handleParameterComponent } from "./parameter";
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
  ast: any,
  parseResultMap: Record<string, MdxParseResult>,
): void {
  // 제거할 노드 인덱스 목록
  const nodesToRemove: Array<{ parent: any; index: number }> = [];

  // JSX 컴포넌트 변환
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: any, index: number | undefined, parent: any) => {
      if (!node.name || index === undefined) return;

      // prose 태그 처리 (예: <prose.h1>, <prose.p> 등)
      if (node.name.startsWith("prose.")) {
        const proseElementType = node.name.split(".")[1];
        if (proseElementType) {
          // 노드 교체 - 배열에서 직접 교체
          parent.children.splice(
            index,
            1,
            handleProseComponent(node, proseElementType),
          );
          return;
        }
      }

      // code 요소인지 확인
      if (node.name === "code") {
        // 코드 내용 추출 및 백틱으로 감싼 텍스트 노드 생성
        const backtickNode = extractCodeContent(node);

        // 원래 노드를 백틱 노드로 교체
        parent.children.splice(index, 1, backtickNode);
        return;
      }

      // 일반 컴포넌트 처리 (대문자로 시작하는 컴포넌트)
      if (!/^[A-Z]/.test(node.name)) return;

      // 컴포넌트 이름과 속성
      const componentName = node.name;

      // 속성 추출
      const props = extractMdxJsxAttributes(node);

      let replacementNode: any = null;
      switch (componentName) {
        case "Figure":
          replacementNode = handleFigureComponent(node, props);
          break;
        case "Hint":
          replacementNode = handleHintComponent(node, props);
          break;
        case "Tabs":
          replacementNode = handleTabsComponent(node, props);
          break;
        case "Details":
          replacementNode = handleDetailsComponent(node, props);
          break;
        case "ContentRef":
          replacementNode = handleContentRefComponent(
            node,
            props,
            parseResultMap,
          );
          break;
        case "VersionGate":
          replacementNode = handleVersionGateComponent(node, props);
          break;
        case "Youtube":
          replacementNode = handleYoutubeComponent(node, props);
          break;
        case "Parameter":
          replacementNode = handleParameterComponent(node, props);
          break;
        case "PaymentV1":
        case "PaymentV2":
        case "Recon":
        case "Console":
        case "Partner":
          replacementNode = handleBadgeComponent(node, componentName);
          break;
        case "Swagger":
          replacementNode = handleSwaggerComponent(node, props);
          break;
        case "SwaggerDescription":
          replacementNode = handleSwaggerDescriptionComponent(node, props);
          break;
        case "SwaggerResponse":
          replacementNode = handleSwaggerResponseComponent(node, props);
          break;
        default:
          // 기본적으로 자식 노드만 유지
          replacementNode = {
            type: "root",
            children: node.children || [],
          };
      }

      if (replacementNode) {
        // 노드 교체
        Object.keys(replacementNode).forEach((key) => {
          if (key !== "type") {
            node[key] = replacementNode[key];
          }
        });
        node.type = replacementNode.type;
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
