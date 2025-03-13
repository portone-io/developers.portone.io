import { visit } from "unist-util-visit";
import { describe, expect, it } from "vitest";

import {
  handleContentRefComponent,
  handleDetailsComponent,
  handleFigureComponent,
  handleHintComponent,
  handleProseComponent,
  handleTabsComponent,
  handleVersionGateComponent,
} from "./mdx-to-markdown";

describe("handleFigureComponent", () => {
  it("캡션이 있는 경우 '(이미지 첨부: {caption})' 형태로 변환한다", () => {
    // 테스트용 Figure 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Figure",
      attributes: {
        src: "image1.png",
        caption: "테스트 이미지",
      },
    };

    // handleFigureComponent 함수 실행
    const result = handleFigureComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(이미지 첨부: 테스트 이미지)",
        },
      ],
    });
  });

  it("캡션이 없는 경우 '(관련 이미지 첨부)' 형태로 변환한다", () => {
    // 테스트용 Figure 노드 생성 (캡션 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Figure",
      attributes: {
        src: "image2.png",
      },
    };

    // handleFigureComponent 함수 실행
    const result = handleFigureComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(관련 이미지 첨부)",
        },
      ],
    });
  });

  it("속성이 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 Figure 노드 생성 (속성 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Figure",
      attributes: {},
    };

    // handleFigureComponent 함수 실행
    const result = handleFigureComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "(관련 이미지 첨부)",
        },
      ],
    });
  });

  it("실제 AST 변환 과정에서 정상적으로 동작하는지 테스트", () => {
    // 테스트용 AST 생성
    const ast = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Figure",
          attributes: {
            src: "image1.png",
            caption: "테스트 이미지",
          },
        },
      ],
    };

    // AST 변환 함수 (transformJsxComponents 함수의 일부 로직)
    visit(
      ast,
      ["mdxJsxFlowElement"],
      (node: any, index: number | undefined, parent: any) => {
        if (node.name === "Figure" && index !== undefined) {
          // Figure 컴포넌트 처리
          const replacementNode = handleFigureComponent(node, {});

          // 노드 교체
          if (replacementNode && parent && Array.isArray(parent.children)) {
            parent.children[index] = replacementNode;
          }
        }
      },
    );

    // 결과 검증
    expect(ast).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "(이미지 첨부: 테스트 이미지)",
            },
          ],
        },
      ],
    });
  });
});

describe("handleHintComponent", () => {
  it("기본 Hint 컴포넌트를 HTML div로 변환한다", () => {
    // 테스트용 Hint 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "힌트 내용입니다." }],
        },
      ],
    };

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="hint">',
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "힌트 내용입니다." }],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
  });

  it("type 속성이 있는 Hint 컴포넌트를 처리한다", () => {
    // 테스트용 Hint 노드 생성 (type 속성 포함)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "경고 메시지입니다." }],
        },
      ],
    };

    // handleHintComponent 함수 실행 (type 속성 추가)
    const result = handleHintComponent(node, { type: "warning" });

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="hint hint-warning">',
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "경고 메시지입니다." }],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
  });

  it("여러 속성이 있는 Hint 컴포넌트를 처리한다", () => {
    // 테스트용 Hint 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "중요 정보입니다." }],
        },
      ],
    };

    // handleHintComponent 함수 실행 (여러 속성 추가)
    const result = handleHintComponent(node, {
      type: "info",
      id: "important-hint",
      custom: "value",
    });

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value:
            '<div class="hint hint-info" data-id="important-hint" data-custom="value">',
        },

        {
          type: "paragraph",
          children: [{ type: "text", value: "중요 정보입니다." }],
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
  });

  it("자식 노드가 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 Hint 노드 생성 (자식 노드 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Hint",
    };

    // handleHintComponent 함수 실행
    const result = handleHintComponent(node, { type: "note" });

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "html",
          value: '<div class="hint hint-note">',
        },
        {
          type: "html",
          value: "</div>",
        },
      ],
    });
  });
});

describe("handleDetailsComponent", () => {
  it("Summary와 Content가 있는 Details 컴포넌트를 HTML details/summary로 변환한다", () => {
    // 테스트용 Details 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Details.Summary",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "자세히 보기" }],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Details.Content",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "상세 내용입니다." }],
            },
          ],
        },
      ],
    };

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<details>" },
        { type: "html", value: "<summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "자세히 보기" }],
        },
        { type: "html", value: "</summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
        { type: "html", value: "</details>" },
      ],
    });
  });

  it("Summary가 없는 경우 기본 텍스트를 사용한다", () => {
    // 테스트용 Details 노드 생성 (Summary 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Details.Content",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "상세 내용입니다." }],
            },
          ],
        },
      ],
    };

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<details>" },
        { type: "html", value: "<summary>" },
        { type: "text", value: "상세 정보" },
        { type: "html", value: "</summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "상세 내용입니다." }],
        },
        { type: "html", value: "</details>" },
      ],
    });
  });

  it("Content가 없는 경우에도 정상적으로 처리한다", () => {
    // 테스트용 Details 노드 생성 (Content 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Details",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Details.Summary",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "자세히 보기" }],
            },
          ],
        },
      ],
    };

    // handleDetailsComponent 함수 실행
    const result = handleDetailsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: "<details>" },
        { type: "html", value: "<summary>" },
        {
          type: "paragraph",
          children: [{ type: "text", value: "자세히 보기" }],
        },
        { type: "html", value: "</summary>" },
        { type: "html", value: "</details>" },
      ],
    });
  });
});

describe("handleTabsComponent", () => {
  it("여러 탭이 있는 Tabs 컴포넌트를 HTML div로 변환한다", () => {
    // 테스트용 Tabs 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          attributes: [
            { type: "mdxJsxAttribute", name: "title", value: "탭1" },
          ],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "첫 번째 탭 내용" }],
            },
          ],
        },
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          attributes: [
            { type: "mdxJsxAttribute", name: "title", value: "탭2" },
          ],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "두 번째 탭 내용" }],
            },
          ],
        },
      ],
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        { type: "html", value: '<div class="tabs-content" data-title="탭1">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "첫 번째 탭 내용" }],
        },
        { type: "html", value: "</div>" },
        { type: "html", value: '<div class="tabs-content" data-title="탭2">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "두 번째 탭 내용" }],
        },
        { type: "html", value: "</div>" },
        { type: "html", value: "</div>" },
      ],
    });
  });

  it("탭 제목이 없는 경우 기본 제목을 사용한다", () => {
    // 테스트용 Tabs 노드 생성 (탭 제목 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "탭 내용" }],
            },
          ],
        },
      ],
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        { type: "html", value: '<div class="tabs-content" data-title="탭">' },
        {
          type: "paragraph",
          children: [{ type: "text", value: "탭 내용" }],
        },
        { type: "html", value: "</div>" },
        { type: "html", value: "</div>" },
      ],
    });
  });

  it("자식 노드가 없는 탭도 정상적으로 처리한다", () => {
    // 테스트용 Tabs 노드 생성 (자식 노드 없는 탭)
    const node = {
      type: "mdxJsxFlowElement",
      name: "Tabs",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "Tabs.Tab",
          attributes: [
            { type: "mdxJsxAttribute", name: "title", value: "빈 탭" },
          ],
        },
      ],
    };

    // handleTabsComponent 함수 실행
    const result = handleTabsComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        { type: "html", value: '<div class="tabs-container">' },
        {
          type: "html",
          value: '<div class="tabs-content" data-title="빈 탭">',
        },
        { type: "html", value: "</div>" },
        { type: "html", value: "</div>" },
      ],
    });
  });
});

describe("handleVersionGateComponent", () => {
  it("v 속성이 있는 경우 주석 스타일 박스로 내용을 감싼다", () => {
    // 테스트용 VersionGate 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "VersionGate",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "V1에서 보여질 내용" }],
        },
      ],
    };

    // handleVersionGateComponent 함수 실행
    const result = handleVersionGateComponent(node, { v: "v1" });

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT START -->",
            },
          ],
        },
        {
          type: "paragraph",
          children: [{ type: "text", value: "V1에서 보여질 내용" }],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "<!-- VERSION-SPECIFIC: V1 ONLY CONTENT END -->",
            },
          ],
        },
      ],
    });
  });

  it("v 속성이 없는 경우 원본 내용만 반환한다", () => {
    // 테스트용 VersionGate 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "VersionGate",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    };

    // handleVersionGateComponent 함수 실행 (v 속성 없음)
    const result = handleVersionGateComponent(node, {});

    // 결과 검증
    expect(result).toEqual({
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "일반 내용" }],
        },
      ],
    });
  });

  it("실제 AST 변환 과정에서 정상적으로 동작하는지 테스트", () => {
    // 테스트용 AST 생성
    const ast = {
      type: "root",
      children: [
        {
          type: "mdxJsxFlowElement",
          name: "VersionGate",
          attributes: [
            {
              type: "mdxJsxAttribute",
              name: "v",
              value: "v2",
            },
          ],
          children: [
            {
              type: "paragraph",
              children: [{ type: "text", value: "V2에서 보여질 내용" }],
            },
          ],
        },
      ],
    };

    // AST 변환 함수 (transformJsxComponents 함수의 일부 로직)
    visit(
      ast,
      ["mdxJsxFlowElement"],
      (node: any, index: number | undefined, parent: any) => {
        if (node.name === "VersionGate" && index !== undefined) {
          // 속성 추출
          const props: Record<string, any> = {};
          if (node.attributes && Array.isArray(node.attributes)) {
            for (const attr of node.attributes) {
              if (attr.name && attr.value !== undefined) {
                props[attr.name] = attr.value;
              }
            }
          }

          // VersionGate 컴포넌트 처리
          const replacementNode = handleVersionGateComponent(node, props);

          // 노드 교체
          if (replacementNode && parent && Array.isArray(parent.children)) {
            parent.children[index] = replacementNode;
          }
        }
      },
    );

    // 결과 검증
    expect(ast).toEqual({
      type: "root",
      children: [
        {
          type: "root",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT START -->",
                },
              ],
            },
            {
              type: "paragraph",
              children: [{ type: "text", value: "V2에서 보여질 내용" }],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "<!-- VERSION-SPECIFIC: V2 ONLY CONTENT END -->",
                },
              ],
            },
          ],
        },
      ],
    });
  });
});

describe("handleProseComponent", () => {
  it("h1 요소를 depth 1의 heading으로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.h1",
      children: [{ type: "text", value: "제목 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "h1");

    // 결과 검증
    expect(result).toEqual({
      type: "heading",
      depth: 1,
      children: [{ type: "text", value: "제목 텍스트" }],
    });
  });

  it("h2부터 h6까지 요소를 적절한 depth의 heading으로 변환한다", () => {
    // h2부터 h6까지 테스트
    for (let i = 2; i <= 6; i++) {
      // 테스트용 Prose 노드 생성
      const node = {
        type: "mdxJsxFlowElement",
        name: `prose.h${i}`,
        children: [{ type: "text", value: `제목 레벨 ${i}` }],
      };

      // handleProseComponent 함수 실행
      const result = handleProseComponent(node, `h${i}`);

      // 결과 검증
      expect(result).toEqual({
        type: "heading",
        depth: i,
        children: [{ type: "text", value: `제목 레벨 ${i}` }],
      });
    }
  });

  it("p 요소를 paragraph로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.p",
      children: [{ type: "text", value: "단락 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "p");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "단락 텍스트" }],
    });
  });

  it("a 요소를 링크로 변환한다", () => {
    // 테스트용 Prose 노드 생성 (링크 속성 포함)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.a",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "href",
          value: "https://example.com",
        },
        {
          type: "mdxJsxAttribute",
          name: "title",
          value: "예제 링크",
        },
      ],
      children: [{ type: "text", value: "링크 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "a");

    // 결과 검증
    expect(result).toEqual({
      type: "link",
      url: "https://example.com",
      title: "예제 링크",
      children: [{ type: "text", value: "링크 텍스트" }],
    });
  });

  it("href 속성이 없는 a 요소는 기본값 '#'을 사용한다", () => {
    // 테스트용 Prose 노드 생성 (href 속성 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.a",
      attributes: [
        {
          type: "mdxJsxAttribute",
          name: "title",
          value: "예제 링크",
        },
      ],
      children: [{ type: "text", value: "링크 텍스트" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "a");

    // 결과 검증
    expect(result).toEqual({
      type: "link",
      url: "#",
      title: "예제 링크",
      children: [{ type: "text", value: "링크 텍스트" }],
    });
  });

  it("blockquote 요소를 인용구로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.blockquote",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "인용구 텍스트" }],
        },
      ],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "blockquote");

    // 결과 검증
    expect(result).toEqual({
      type: "blockquote",
      children: [
        {
          type: "paragraph",
          children: [{ type: "text", value: "인용구 텍스트" }],
        },
      ],
    });
  });

  it("ul 요소를 순서 없는 목록으로 변환한다", () => {
    // 테스트용 Prose 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.ul",
      children: [
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 1" }],
        },
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 2" }],
        },
      ],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "ul");

    // 결과 검증
    expect(result).toEqual({
      type: "list",
      ordered: false,
      spread: false,
      children: [
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 1" }],
        },
        {
          type: "listItem",
          children: [{ type: "text", value: "항목 2" }],
        },
      ],
    });
  });

  it("지원하지 않는 요소는 기본적으로 paragraph로 변환한다", () => {
    // 테스트용 Prose 노드 생성 (지원하지 않는 요소)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.unknown",
      children: [{ type: "text", value: "알 수 없는 요소" }],
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "unknown");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [{ type: "text", value: "알 수 없는 요소" }],
    });
  });

  it("children이 없는 경우 빈 배열을 사용한다", () => {
    // 테스트용 Prose 노드 생성 (children 없음)
    const node = {
      type: "mdxJsxFlowElement",
      name: "prose.p",
    };

    // handleProseComponent 함수 실행
    const result = handleProseComponent(node, "p");

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [],
    });
  });
});

describe("handleContentRefComponent", () => {
  it("slug가 있고 해당 문서가 존재하는 경우 제목으로 링크를 생성한다", () => {
    // 테스트용 ContentRef 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "ContentRef",
    };

    // 테스트용 parseResultMap 생성
    const parseResultMap = {
      "guide/payment": {
        filePath: "/path/to/guide/payment.mdx",
        slug: "guide/payment",
        frontmatter: {
          title: "결제 가이드",
        },
        imports: [],
        ast: {},
        content: "",
      },
    };

    // handleContentRefComponent 함수 실행
    const result = handleContentRefComponent(
      node,
      { slug: "guide/payment" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/llms/guide/payment.md",
          children: [{ type: "text", value: "결제 가이드" }],
        },
      ],
    });
  });

  it("slug가 있지만 해당 문서가 존재하지 않는 경우 기본 텍스트로 링크를 생성한다", () => {
    // 테스트용 ContentRef 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "ContentRef",
    };

    // 빈 parseResultMap 생성
    const parseResultMap = {};

    // handleContentRefComponent 함수 실행
    const result = handleContentRefComponent(
      node,
      { slug: "non-existent/page" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/llms/non-existent/page.md",
          children: [{ type: "text", value: "링크" }],
        },
      ],
    });
  });

  it("slug가 '/'로 시작하는 경우 정상적으로 처리한다", () => {
    // 테스트용 ContentRef 노드 생성
    const node = {
      type: "mdxJsxFlowElement",
      name: "ContentRef",
    };

    // 테스트용 parseResultMap 생성
    const parseResultMap = {
      "api/overview": {
        filePath: "/path/to/api/overview.mdx",
        slug: "api/overview",
        frontmatter: {
          title: "API 개요",
        },
        imports: [],
        ast: {},
        content: "",
      },
    };

    // handleContentRefComponent 함수 실행 (slug가 '/'로 시작)
    const result = handleContentRefComponent(
      node,
      { slug: "/api/overview" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "/llms/api/overview.md",
          children: [{ type: "text", value: "API 개요" }],
        },
      ],
    });
  });
});
