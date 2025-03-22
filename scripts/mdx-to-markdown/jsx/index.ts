import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import type { Node, Parent } from "unist";
import { visit } from "unist-util-visit";

import { type MdxParseResult } from "../mdx-parser";
import { handleApiLinkComponent } from "./apiLink";
import { handleBadgeComponent } from "./badge";
import { extractCodeContent } from "./code";
import { extractMdxJsxAttributes } from "./common";
import { handleConditionComponent } from "./condition";
import { handleContentRefComponent } from "./contentRef";
import {
  handleDetailsComponent,
  handleDetailsContentComponent,
  handleDetailsSummaryComponent,
} from "./details";
import { handleFigureComponent } from "./figure";
import { handleHintComponent } from "./hint";
import { handleProseComponent } from "./prose";
import {
  handleSwaggerComponent,
  handleSwaggerDescriptionComponent,
  handleSwaggerResponseComponent,
} from "./swagger";
import { handleTabComponent, handleTabsComponent } from "./tabs";
import { handleVersionGateComponent } from "./versionGate";
import { handleYoutubeComponent } from "./youtube";

/**
 * JSX 컴포넌트를 마크다운으로 변환하는 함수
 * @param ast MDX AST
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 * @param useMarkdownLinks 내부 링크를 마크다운 파일 링크로 변환할지 여부 (true: 마크다운 파일 링크, false: 웹페이지 링크)
 */
export function transformJsxComponents(
  ast: Node,
  parseResultMap: Record<string, MdxParseResult>,
  useMarkdownLinks: boolean = true,
): void {
  // JSX Flow 컴포넌트 변환
  visit(
    ast,
    ["mdxJsxFlowElement", "mdxJsxTextElement"],
    (node: Node, index: number | undefined, parent: Parent | undefined) => {
      // Type assertion to handle flow element
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
            handleProseComponent(jsxNode, proseElementType, (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
            ),
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

      let replacementNode: Node;
      switch (componentName) {
        case "Figure":
          replacementNode = handleFigureComponent(props);
          break;
        case "Hint":
          replacementNode = handleHintComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "Tabs":
          replacementNode = handleTabsComponent(jsxNode, (innerAst: Node) =>
            transformJsxComponents(innerAst, parseResultMap, useMarkdownLinks),
          );
          break;
        case "Tabs.Tab":
          replacementNode = handleTabComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "Details":
          replacementNode = handleDetailsComponent(jsxNode, (innerAst: Node) =>
            transformJsxComponents(innerAst, parseResultMap, useMarkdownLinks),
          );
          break;
        case "Details.Summary":
          replacementNode = handleDetailsSummaryComponent(
            jsxNode,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "Details.Content":
          replacementNode = handleDetailsContentComponent(
            jsxNode,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "Condition":
          replacementNode = handleConditionComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "ContentRef":
          replacementNode = handleContentRefComponent(
            props,
            parseResultMap,
            useMarkdownLinks,
          );
          break;
        case "VersionGate":
          // VersionGate 컴포넌트 처리 - 내부에서 재귀적으로 transformJsxComponents 호출
          // 클로저를 사용하여 parseResultMap을 캡처한 함수 전달
          replacementNode = handleVersionGateComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
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
          replacementNode = handleSwaggerComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "SwaggerDescription":
          replacementNode = handleSwaggerDescriptionComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        case "SwaggerResponse":
          replacementNode = handleSwaggerResponseComponent(
            jsxNode,
            props,
            (innerAst: Node) =>
              transformJsxComponents(
                innerAst,
                parseResultMap,
                useMarkdownLinks,
              ),
          );
          break;
        default:
          // 기본적으로 자식 노드만 유지
          replacementNode = {
            type: "root",
            children: jsxNode.children || [],
          } as Parent;

          // 자식 노드들에 대해 재귀적으로 transformJsxComponents 호출
          if (
            (replacementNode as Parent).children &&
            (replacementNode as Parent).children.length > 0
          ) {
            transformJsxComponents(
              replacementNode,
              parseResultMap,
              useMarkdownLinks,
            );
          }
      }

      // 노드 교체
      parent.children.splice(index, 1, replacementNode);
    },
  );
}
