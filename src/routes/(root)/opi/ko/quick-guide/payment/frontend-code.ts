import type { APIHandler } from "@solidjs/start/server";

import {
  type CodeExample,
  PayMethod,
} from "~/state/interactive-docs/index.jsx";
import { PaymentGateway } from "~/type";

import * as files from "./_preview/frontend";
import { type Params, type Sections } from "./_preview/type";
import { formatCodeExample, markdownResponse } from "./_preview/utils";

/**
 * 프론트엔드 코드 예제를 위한 GET 핸들러
 *
 * 제공된 파라미터를 기반으로 결제 연동을 위한 프론트엔드 코드 예제를 생성합니다.
 * 여러 프론트엔드 프레임워크(html, react)를 지원하며
 * 입력 파라미터가 지원되는 결제 게이트웨이와 호환되는지 검증합니다.
 *
 * @param event - 서버로부터의 요청 이벤트
 * @returns Promise<Response> - 코드 예제 또는 오류 메시지를 포함하는 마크다운 응답
 */
export const GET: APIHandler = (event): Promise<Response> => {
  // 요청 URL에서 쿼리 파라미터 추출
  const url = new URL(event.request.url);
  const pg = PaymentGateway.parse(url.searchParams.get("pg"));
  const payMethod = PayMethod.parse(url.searchParams.get("payMethod"));
  const framework = url.searchParams.get("framework");

  const response = (() => {
    try {
      // 결제 파라미터 검증 및 정규화
      // 파라미터가 지원되는 PG와 호환되는지 확인
      const codeParams = {
        pgName: pg,
        payMethod: payMethod,
      } as Params;

      // 여러 코드 예제를 하나의 마크다운 문자열로 포맷팅하는 헬퍼 함수
      const makeContent = (examples: CodeExample<Params, Sections>[]) => {
        return examples
          .map((example) => formatCodeExample(example, codeParams, () => pg))
          .join("\n");
      };

      // 요청된 프레임워크에 기반한 코드 예제 생성
      // 대소문자 구분 없는 프레임워크 이름 매칭
      switch (framework?.toLowerCase()) {
        case "html":
          return markdownResponse(makeContent(files.HTML), 200);
        case "react":
          return markdownResponse(makeContent(files.React), 200);
        default:
          // 지원되지 않는 프레임워크에 대한 오류 반환 및 지원되는 옵션 목록 제공
          return markdownResponse(
            `지원되지 않는 framework: ${framework}. 지원하는 framework: html, react`,
            400,
          );
      }
    } catch (error) {
      // 알려진 오류를 특정 오류 메시지로 처리
      if (error instanceof Error) {
        return markdownResponse(error.message, 400);
      }
      // 예상치 못한 오류를 일반 메시지로 처리
      return markdownResponse("An unknown error occurred", 500);
    }
  })();

  // 응답을 해결된 프로미스로 반환
  return Promise.resolve(response);
};
