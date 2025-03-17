import type { Node } from "unist";
import { describe, expect, it } from "vitest";

import type { MdxParseResult } from "../mdx-parser";
import { handleContentRefComponent } from "./contentRef";

describe("handleContentRefComponent", () => {
  it("slug가 있고 해당 문서가 존재하는 경우 제목으로 링크를 생성한다", () => {
    // 테스트용 parseResultMap 생성
    const parseResultMap: Record<string, MdxParseResult> = {
      "guide/payment": {
        filePath: "/path/to/guide/payment.mdx",
        slug: "guide/payment",
        frontmatter: {
          title: "결제 가이드",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    // handleContentRefComponent 함수 실행
    const result = handleContentRefComponent(
      { slug: "guide/payment" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/guide/payment.md",
          children: [{ type: "text", value: "결제 가이드" }],
        },
      ],
    });
  });

  it("slug가 있지만 해당 문서가 존재하지 않는 경우 기본 텍스트로 링크를 생성한다", () => {
    // 빈 parseResultMap 생성
    const parseResultMap = {};

    // handleContentRefComponent 함수 실행
    const result = handleContentRefComponent(
      { slug: "non-existent/page" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/non-existent/page.md",
          children: [{ type: "text", value: "링크" }],
        },
      ],
    });
  });

  it("slug가 '/'로 시작하는 경우 정상적으로 처리한다", () => {
    // 테스트용 parseResultMap 생성
    const parseResultMap: Record<string, MdxParseResult> = {
      "api/overview": {
        filePath: "/path/to/api/overview.mdx",
        slug: "api/overview",
        frontmatter: {
          title: "API 개요",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    // handleContentRefComponent 함수 실행 (slug가 '/'로 시작)
    const result = handleContentRefComponent(
      { slug: "/api/overview" },
      parseResultMap,
    );

    // 결과 검증
    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/api/overview.md",
          children: [{ type: "text", value: "API 개요" }],
        },
      ],
    });
  });

  // 실제 opi/ko/readme/index.mdx에서 사용된 ContentRef 슬러그를 테스트
  it("opi/ko/readme/index.mdx에서 사용된 통합 준비 가이드 슬러그를 처리한다", () => {
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/ready/readme": {
        filePath: "/path/to/opi/ko/integration/ready/readme.mdx",
        slug: "opi/ko/integration/ready/readme",
        frontmatter: {
          title: "연동 준비하기",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    const result = handleContentRefComponent(
      { slug: "/opi/ko/integration/ready/readme" },
      parseResultMap,
    );

    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/ready/readme.md",
          children: [{ type: "text", value: "연동 준비하기" }],
        },
      ],
    });
  });

  it("index.mdx에서 사용된 V1 인증결제 슬러그를 처리한다", () => {
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/start/v1/auth": {
        filePath: "/path/to/opi/ko/integration/start/v1/auth.mdx",
        slug: "opi/ko/integration/start/v1/auth",
        frontmatter: {
          title: "인증결제 연동하기",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    const result = handleContentRefComponent(
      { slug: "/opi/ko/integration/start/v1/auth" },
      parseResultMap,
    );

    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/start/v1/auth.md",
          children: [{ type: "text", value: "인증결제 연동하기" }],
        },
      ],
    });
  });

  it("index.mdx에서 사용된 V2 결제창 연동 슬러그를 처리한다", () => {
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/start/v2/checkout": {
        filePath: "/path/to/opi/ko/integration/start/v2/checkout.mdx",
        slug: "opi/ko/integration/start/v2/checkout",
        frontmatter: {
          title: "결제창 연동하기",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    const result = handleContentRefComponent(
      { slug: "/opi/ko/integration/start/v2/checkout" },
      parseResultMap,
    );

    expect(result).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/start/v2/checkout.md",
          children: [{ type: "text", value: "결제창 연동하기" }],
        },
      ],
    });
  });

  it("index.mdx에서 사용된 웹훅 가이드 슬러그를 처리한다", () => {
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/webhook/readme-v1": {
        filePath: "/path/to/opi/ko/integration/webhook/readme-v1.mdx",
        slug: "opi/ko/integration/webhook/readme-v1",
        frontmatter: {
          title: "웹훅 연동하기 (V1)",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
      "opi/ko/integration/webhook/readme-v2": {
        filePath: "/path/to/opi/ko/integration/webhook/readme-v2.mdx",
        slug: "opi/ko/integration/webhook/readme-v2",
        frontmatter: {
          title: "웹훅 연동하기 (V2)",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    const resultV1 = handleContentRefComponent(
      { slug: "/opi/ko/integration/webhook/readme-v1" },
      parseResultMap,
    );

    expect(resultV1).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/webhook/readme-v1.md",
          children: [{ type: "text", value: "웹훅 연동하기 (V1)" }],
        },
      ],
    });

    const resultV2 = handleContentRefComponent(
      { slug: "/opi/ko/integration/webhook/readme-v2" },
      parseResultMap,
    );

    expect(resultV2).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/webhook/readme-v2.md",
          children: [{ type: "text", value: "웹훅 연동하기 (V2)" }],
        },
      ],
    });
  });

  it("index.mdx에서 사용된 SDK 관련 슬러그를 처리한다", () => {
    const parseResultMap: Record<string, MdxParseResult> = {
      "sdk/ko/v1-sdk/javascript-sdk/readme": {
        filePath: "/path/to/sdk/ko/v1-sdk/javascript-sdk/readme.mdx",
        slug: "sdk/ko/v1-sdk/javascript-sdk/readme",
        frontmatter: {
          title: "JavaScript SDK (V1)",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
      "sdk/ko/v2-sdk/readme": {
        filePath: "/path/to/sdk/ko/v2-sdk/readme.mdx",
        slug: "sdk/ko/v2-sdk/readme",
        frontmatter: {
          title: "JavaScript SDK (V2)",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    const resultV1 = handleContentRefComponent(
      { slug: "/sdk/ko/v1-sdk/javascript-sdk/readme" },
      parseResultMap,
    );

    expect(resultV1).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/sdk/ko/v1-sdk/javascript-sdk/readme.md",
          children: [{ type: "text", value: "JavaScript SDK (V1)" }],
        },
      ],
    });

    const resultV2 = handleContentRefComponent(
      { slug: "/sdk/ko/v2-sdk/readme" },
      parseResultMap,
    );

    expect(resultV2).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/sdk/ko/v2-sdk/readme.md",
          children: [{ type: "text", value: "JavaScript SDK (V2)" }],
        },
      ],
    });
  });

  it("index.mdx에서 사용된 PG사별 가이드 슬러그를 처리한다", () => {
    const parseResultMap: Record<string, MdxParseResult> = {
      "opi/ko/integration/pg/v1/readme": {
        filePath: "/path/to/opi/ko/integration/pg/v1/readme.mdx",
        slug: "opi/ko/integration/pg/v1/readme",
        frontmatter: {
          title: "PG사별 결제 연동 가이드 (V1)",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
      "opi/ko/integration/pg/v2/readme": {
        filePath: "/path/to/opi/ko/integration/pg/v2/readme.mdx",
        slug: "opi/ko/integration/pg/v2/readme",
        frontmatter: {
          title: "PG사별 결제 연동 가이드 (V2)",
        },
        imports: [],
        ast: {} as unknown as Node,
        content: "",
      },
    };

    const resultV1 = handleContentRefComponent(
      { slug: "/opi/ko/integration/pg/v1/readme" },
      parseResultMap,
    );

    expect(resultV1).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/pg/v1/readme.md",
          children: [{ type: "text", value: "PG사별 결제 연동 가이드 (V1)" }],
        },
      ],
    });

    const resultV2 = handleContentRefComponent(
      { slug: "/opi/ko/integration/pg/v2/readme" },
      parseResultMap,
    );

    expect(resultV2).toEqual({
      type: "paragraph",
      children: [
        {
          type: "link",
          url: "https://developers.portone.io/opi/ko/integration/pg/v2/readme.md",
          children: [{ type: "text", value: "PG사별 결제 연동 가이드 (V2)" }],
        },
      ],
    });
  });
});
