import type { MdxJsxFlowElement, MdxJsxTextElement } from "mdast-util-mdx";
import { replaceToHtml } from "scripts/mdx-to-markdown/jsx/replaceToHtml";
import type { Node, Parent } from "unist";

import { type MdxParseResult } from "../mdx-parser";
import { handleApiLinkComponent } from "./apiLink";
import { handleBadgeComponent } from "./badge";
import { extractCodeContent } from "./code";
import { unwrapJsxNode } from "./common";
import { handleConditionComponent } from "./condition";
import { handleContentRefComponent } from "./contentRef";
import {
  handleDetailsComponent,
  handleDetailsContentComponent,
  handleDetailsSummaryComponent,
} from "./details";
import { handleFigureComponent } from "./figure";
import { handleHintComponent } from "./hint";
import { validateImportedMdx } from "./importedMdx";
import { handleParameterTypeDefComponent } from "./parameter";
import { handleProseComponent } from "./prose";
import { handleSDKParameterComponent, sdkChangelog } from "./sdk";
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
 * @param slug 현재 파일의 slug
 * @param ast MDX AST
 * @param parseResultMap 모든 MDX 파일의 파싱 결과 맵 (slug -> MdxParseResult)
 * @param useMarkdownLinks 내부 링크를 마크다운 파일 링크로 변환할지 여부 (true: 마크다운 파일 링크, false: 웹페이지 링크)
 * @returns 변환된 AST 노드와 처리되지 않은 태그 목록
 */
export function transformJsxComponents(
  slug: string,
  ast: Node,
  parseResultMap: Record<string, MdxParseResult>,
  useMarkdownLinks: boolean = true,
): { ast: Node; unhandledTags: Set<string> } {
  const emptySet = new Set<string>();

  const parseResult = parseResultMap[slug]!;

  // Collect all imported element names
  const importedNonComponents = new Set(
    parseResult.imports
      .filter((item) => !item.from.includes("components"))
      .map((item) => item.name),
  );
  const transformRecursively = (innerAst: Node) =>
    transformJsxComponents(slug, innerAst, parseResultMap, useMarkdownLinks);

  const result: { ast: Node; unhandledTags: Set<string> } = (() => {
    const astAsParent = ast as Parent;
    if (ast.type === "mdxJsxFlowElement" || ast.type === "mdxJsxTextElement") {
      // Type assertion to handle flow element
      const jsxNode = ast as MdxJsxFlowElement | MdxJsxTextElement;

      // 컴포넌트 이름과 속성
      const componentName = jsxNode.name;

      // prose 태그 처리 (예: <prose.h1>, <prose.p> 등)
      if (componentName?.startsWith("prose.")) {
        const proseElementType = componentName.split(".")[1];
        if (proseElementType) {
          // 노드 교체 - 배열에서 직접 교체
          return handleProseComponent(
            jsxNode,
            proseElementType,
            transformRecursively,
          );
        } else {
          return unwrapJsxNode(jsxNode, transformRecursively);
        }
      } else {
        switch (componentName) {
          case "code":
            return {
              ast: extractCodeContent(jsxNode),
              unhandledTags: emptySet,
            };
          case "Figure":
            return {
              ast: handleFigureComponent(jsxNode),
              unhandledTags: emptySet,
            };
          case "Hint":
            return handleHintComponent(jsxNode, transformRecursively);
          case "Tabs":
            return handleTabsComponent(jsxNode, transformRecursively);
          case "Tabs.Tab":
            return handleTabComponent(jsxNode, transformRecursively);
          case "Details":
            return handleDetailsComponent(jsxNode, transformRecursively);
          case "Details.Summary":
            return handleDetailsSummaryComponent(jsxNode, transformRecursively);
          case "Details.Content":
            return handleDetailsContentComponent(jsxNode, transformRecursively);
          case "Condition":
            return handleConditionComponent(jsxNode, transformRecursively);
          case "ContentRef":
            return {
              ast: handleContentRefComponent(
                jsxNode,
                parseResultMap,
                useMarkdownLinks,
              ),
              unhandledTags: emptySet,
            };
          case "VersionGate":
            return handleVersionGateComponent(jsxNode, transformRecursively);
          case "Youtube":
            return {
              ast: handleYoutubeComponent(jsxNode),
              unhandledTags: emptySet,
            };
          case "ApiLink":
            return {
              ast: handleApiLinkComponent(jsxNode),
              unhandledTags: emptySet,
            };
          case "PaymentV1":
          case "PaymentV2":
          case "Recon":
          case "Console":
          case "Partner":
            return {
              ast: handleBadgeComponent(componentName),
              unhandledTags: emptySet,
            };
          case "Swagger":
            return handleSwaggerComponent(jsxNode, transformRecursively);
          case "SwaggerDescription":
            return handleSwaggerDescriptionComponent(
              jsxNode,
              transformRecursively,
            );
          case "SwaggerResponse":
            return handleSwaggerResponseComponent(
              jsxNode,
              transformRecursively,
            );
          case "Parameter.TypeDef":
            return handleParameterTypeDefComponent(
              jsxNode,
              transformRecursively,
            );
          case "SDKParameter":
            return handleSDKParameterComponent(jsxNode);
          case "SDKChangelog":
            return {
              ast: sdkChangelog(),
              unhandledTags: emptySet,
            };
          case "br":
          case "table":
          case "thead":
          case "tbody":
          case "th":
          case "tr":
          case "td":
            return replaceToHtml(jsxNode, transformRecursively);
          case "Parameter":
          case "Parameter.Details":
          case "center":
          case "EasyGuideLink":
            return unwrapJsxNode(jsxNode, transformRecursively);
          default: {
            const importedMdx = validateImportedMdx(
              jsxNode,
              parseResult.filePath,
              parseResult.imports,
              parseResultMap,
            );

            if (importedMdx) {
              return transformJsxComponents(
                importedMdx.slug,
                importedMdx.ast,
                parseResultMap,
                useMarkdownLinks,
              );
            }

            const result = unwrapJsxNode(jsxNode, transformRecursively);
            return {
              ast: result.ast,
              unhandledTags: result.unhandledTags.add(componentName ?? "null"),
            };
          }
        }
      }
    } else if (astAsParent.children && astAsParent.children.length > 0) {
      const results = astAsParent.children.map(transformRecursively);

      const newAst = {
        ...ast,
        children: results.map((result) => result.ast),
      };

      const unhandledTags = results.reduce(
        (acc, result) => acc.union(result.unhandledTags),
        new Set<string>(),
      );

      return {
        ast: newAst,
        unhandledTags,
      };
    } else {
      return { ast, unhandledTags: emptySet };
    }
  })();

  return {
    ast: result.ast,
    unhandledTags: result.unhandledTags.difference(importedNonComponents),
  };
}
