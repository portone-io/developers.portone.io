import type { Root } from "mdast";
import { describe, expect, it } from "vitest";

import type { MdxParseResult } from "../mdx-parser";
import { transformJsxComponents } from ".";

const emptyRoot: Root = {
  type: "root",
  children: [],
};

describe("transformJsxComponents", () => {
  it("VersionGate 내부의 ContentRef 컴포넌트를 재귀적으로 처리한다", () => {
    // 테스트용 parseResultMap 생성
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/webhook/readme-v1": {
        filePath: "/path/to/opi/ko/integration/webhook/readme-v1.mdx",
        slug: "opi/ko/integration/webhook/readme-v1",
        frontmatter: {
          title: "웹훅 연동하기 (V1)",
        },
        imports: [],
        ast: emptyRoot,
        content: "",
      },
      "opi/ko/integration/webhook/readme-v2": {
        filePath: "/path/to/opi/ko/integration/webhook/readme-v2.mdx",
        slug: "opi/ko/integration/webhook/readme-v2",
        frontmatter: {
          title: "웹훅 연동하기 (V2)",
        },
        imports: [],
        ast: emptyRoot,
        content: "",
      },
    };

    // 테스트용 AST 생성 - VersionGate 내부에 ContentRef가 있는 구조
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "일반 텍스트 내용",
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "VersionGate",
          attributes: [{ type: "mdxJsxAttribute", name: "v", value: "v1" }],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "V1 버전 설명",
                },
              ],
            },
            {
              type: "mdxJsxFlowElement",
              name: "ContentRef",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "slug",
                  value: "/opi/ko/integration/webhook/readme-v1",
                },
              ],
              children: [],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "VersionGate",
          attributes: [{ type: "mdxJsxAttribute", name: "v", value: "v2" }],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "V2 버전 설명",
                },
              ],
            },
            {
              type: "mdxJsxFlowElement",
              name: "ContentRef",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "slug",
                  value: "/opi/ko/integration/webhook/readme-v2",
                },
              ],
              children: [],
            },
          ],
        },
      ],
    };

    // transformJsxComponents 함수 실행
    const { ast: transformedAst } = transformJsxComponents(ast, parseResultMap);

    // 결과 검증 - VersionGate 내부의 ContentRef가 마크다운 링크로 변환되었는지 확인
    expect(transformedAst).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "일반 텍스트 내용",
            },
          ],
        },
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "V1 버전 설명",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: "https://developers.portone.io/opi/ko/integration/webhook/readme-v1.md",
                  children: [{ type: "text", value: "웹훅 연동하기 (V1)" }],
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT END -->",
                },
              ],
            },
          ],
        },
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "V2 버전 설명",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: "https://developers.portone.io/opi/ko/integration/webhook/readme-v2.md",
                  children: [{ type: "text", value: "웹훅 연동하기 (V2)" }],
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("중첩된 VersionGate 내부의 ContentRef 컴포넌트도 처리한다", () => {
    // 테스트용 parseResultMap 생성
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/start/v1/auth": {
        filePath: "/path/to/opi/ko/integration/start/v1/auth.mdx",
        slug: "opi/ko/integration/start/v1/auth",
        frontmatter: {
          title: "인증결제 연동하기",
        },
        imports: [],
        ast: emptyRoot,
        content: "",
      },
    };

    // 테스트용 AST 생성 - 중첩된 VersionGate 구조
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "VersionGate",
          attributes: [{ type: "mdxJsxAttribute", name: "v", value: "v1" }],
          children: [
            {
              type: "heading",
              depth: 2,
              children: [
                {
                  type: "text",
                  value: "결제 연동하기",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value:
                    "해당 가이드를 통해 결제창을 손쉽게 연동할 수 있습니다.",
                },
              ],
            },
            {
              type: "mdxJsxFlowElement",
              name: "ContentRef",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "slug",
                  value: "/opi/ko/integration/start/v1/auth",
                },
              ],
              children: [],
            },
            {
              type: "mdxJsxFlowElement",
              name: "VersionGate",
              attributes: [{ type: "mdxJsxAttribute", name: "v", value: "v1" }],
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      value: "V1 전용 추가 설명",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    // transformJsxComponents 함수 실행
    const { ast: transformedAst } = transformJsxComponents(ast, parseResultMap);

    // 결과 검증 - 중첩된 VersionGate와 ContentRef가 모두 처리되었는지 확인
    expect(transformedAst).toEqual({
      type: "root",
      children: [
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT START -->",
                },
              ],
            },
            {
              type: "heading",
              depth: 2,
              children: [
                {
                  type: "text",
                  value: "결제 연동하기",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value:
                    "해당 가이드를 통해 결제창을 손쉽게 연동할 수 있습니다.",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: "https://developers.portone.io/opi/ko/integration/start/v1/auth.md",
                  children: [{ type: "text", value: "인증결제 연동하기" }],
                },
              ],
            },
            {
              type: "root",
              children: [
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "html",
                      value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT START -->",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "text",
                      value: "V1 전용 추가 설명",
                    },
                  ],
                },
                {
                  type: "paragraph",
                  children: [
                    {
                      type: "html",
                      value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT END -->",
                    },
                  ],
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("다양한 JSX 컴포넌트가 혼합된 경우도 처리한다", () => {
    // 테스트용 parseResultMap 생성
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/ready/readme": {
        filePath: "/path/to/opi/ko/integration/ready/readme.mdx",
        slug: "opi/ko/integration/ready/readme",
        frontmatter: {
          title: "연동 준비하기",
        },
        imports: [],
        ast: emptyRoot,
        content: "",
      },
    };

    // 테스트용 AST 생성 - 다양한 컴포넌트가 혼합된 구조
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Hint",
          attributes: [
            { type: "mdxJsxAttribute", name: "style", value: "info" },
          ],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "중요 안내사항입니다.",
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "연동 준비하기",
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "VersionGate",
          attributes: [{ type: "mdxJsxAttribute", name: "v", value: "v2" }],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "V2 버전에서는 다음 가이드를 참고하세요.",
                },
              ],
            },
            {
              type: "mdxJsxFlowElement",
              name: "ContentRef",
              attributes: [
                {
                  type: "mdxJsxAttribute",
                  name: "slug",
                  value: "/opi/ko/integration/ready/readme",
                },
              ],
              children: [],
            },
          ],
        },
      ],
    };

    // transformJsxComponents 함수 실행
    const { ast: transformedAst } = transformJsxComponents(ast, parseResultMap);

    // 결과 검증 - 다양한 컴포넌트가 모두 처리되었는지 확인
    expect(transformedAst).toEqual({
      type: "root",
      children: [
        {
          type: "root",
          children: [
            {
              type: "html",
              value: '<div class="hint" data-style="info">',
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "중요 안내사항입니다.",
                },
              ],
            },
            {
              type: "html",
              value: "</div>",
            },
          ],
        },
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "연동 준비하기",
            },
          ],
        },
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "V2 버전에서는 다음 가이드를 참고하세요.",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "link",
                  url: "https://developers.portone.io/opi/ko/integration/ready/readme.md",
                  children: [{ type: "text", value: "연동 준비하기" }],
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it("Condition 컴포넌트를 HTML 주석으로 처리한다", () => {
    // 테스트용 parseResultMap 생성
    const parseResultMap: Record<string, MdxParseResult> = {};

    // 테스트용 AST 생성 - 다양한 속성을 가진 Condition 컴포넌트
    const ast: Root = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Condition",
          attributes: [
            { type: "mdxJsxAttribute", name: "if", value: "browser" },
          ],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "브라우저에서만 보여질 내용",
                },
              ],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Condition",
          attributes: [
            { type: "mdxJsxAttribute", name: "when", value: "future" },
          ],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "미래에 보여질 내용",
                },
              ],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Condition",
          attributes: [
            { type: "mdxJsxAttribute", name: "language", value: "js" },
          ],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "자바스크립트 관련 내용",
                },
              ],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Condition",
          attributes: [
            { type: "mdxJsxAttribute", name: "custom", value: "value" },
          ],
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "커스텀 조건 내용",
                },
              ],
            },
          ],
        },
      ],
    };

    // transformJsxComponents 함수 실행
    const { ast: transformedAst } = transformJsxComponents(ast, parseResultMap);

    // 결과 검증 - 각 Condition 컴포넌트가 HTML 주석으로 변환되었는지 확인
    expect(transformedAst).toEqual({
      type: "root",
      children: [
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT if=browser START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "브라우저에서만 보여질 내용",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT if=browser END -->",
                },
              ],
            },
          ],
        },
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT when=future START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "미래에 보여질 내용",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT when=future END -->",
                },
              ],
            },
          ],
        },
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT language=js START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "자바스크립트 관련 내용",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT language=js END -->",
                },
              ],
            },
          ],
        },
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT custom=value START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "커스텀 조건 내용",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "html",
                  value: "<!-- CONDITIONAL CONTENT custom=value END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
