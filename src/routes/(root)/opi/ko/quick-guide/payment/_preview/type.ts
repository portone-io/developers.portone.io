import type { ConvertToPgParam, PgOptions } from "~/state/interactive-docs";

export const pgOptions = {
  toss: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  nice: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  smartro: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer", "mobile"],
  },
  kpn: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer", "mobile"],
  },
  inicis: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  ksnet: {
    payMethods: ["card", "virtualAccount", "easyPay", "transfer", "mobile"],
  },
  kcp: {
    payMethods: [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ],
  },
  kakao: {
    payMethods: ["easyPay"],
  },
  naver: {
    payMethods: ["easyPay"],
  },
  tosspay: {
    payMethods: ["easyPay"],
  },
  hyphen: {
    payMethods: ["easyPay"],
  },
  eximbay: {
    payMethods: ["card"],
  },
} as const satisfies PgOptions;

export type Params = {
  smartRouting: boolean;
  pg: ConvertToPgParam<typeof pgOptions>;
};

/*
 * pg, payMethod, smartRouting 파라미터 조합이 pgOptions에 정의된 값인지 확인
 * @param pg - PG 이름. null이면 pgOptions의 첫 번째 키 반환
 * @param payMethod - 결제 방식. null이면 pgOptions[pg]의 첫 번째 payMethod 반환
 * @param smartRouting - 스마트 라우팅 여부. "true" 또는 "false". null이면 false로 처리
 * @returns {Params} - 성공 시 Params 타입
 * @throws {Error} - 실패 시 메세지가 포함된 에러
 */
export function validateParams(params: {
  pg: string | null;
  payMethod: string | null;
  smartRouting: string | null;
}): Params {
  const { pg, payMethod, smartRouting } = params;

  // Nested function to parse smartRouting parameter
  const parseSmartRouting = (value: string | null): boolean => {
    if (value === null || value.toLowerCase() === "false") {
      return false;
    } else if (value.toLowerCase() === "true") {
      return true;
    } else {
      throw new Error("smartRouting은 true 또는 false여야 합니다");
    }
  };

  // Nested function to validate PG name
  const validatePg = (pgValue: string): Params["pg"]["name"] => {
    const normalizedPg = pgValue.toLowerCase();
    const supportedPgs = Object.keys(pgOptions);
    const pgName = supportedPgs.find((pg) => pg.toLowerCase() === normalizedPg);
    if (!pgName) {
      const availablePgs = supportedPgs.join(", ");
      throw new Error(
        `지원하지 않는 pg: ${pgValue}. 사용 가능한 pg: ${availablePgs}`,
      );
    }
    return pgName as Params["pg"]["name"];
  };

  // Nested function to validate if payMethod is supported by pg
  const validatePayMethodForPg = (
    pgValue: Params["pg"]["name"],
    payMethodValue: string,
  ): string => {
    const normalizedPayMethod = payMethodValue.toLowerCase();
    const supportedPayMethods = pgOptions[pgValue].payMethods;

    const payMethod = supportedPayMethods.find(
      (method) => method.toLowerCase() === normalizedPayMethod,
    );
    if (!payMethod) {
      const availablePayMethods = supportedPayMethods.join(", ");
      throw new Error(
        `해당 pg에서 지원하지 않는 payMethod: ${payMethodValue}. ${pgValue}에서 사용 가능한 payMethod: ${availablePayMethods}`,
      );
    } else {
      return payMethod;
    }
  };

  // Nested function to find first pg supporting a payMethod
  const findPgForPayMethod = (
    payMethodValue: string,
  ): [Params["pg"]["name"], string] => {
    const normalizedPayMethod = payMethodValue.toLowerCase();

    const pgEntry = Object.entries(pgOptions).find(([_, options]) =>
      options.payMethods.some(
        (method) => method.toLowerCase() === normalizedPayMethod,
      ),
    );

    if (!pgEntry) {
      throw new Error(`지원하지 않는 payMethod: ${payMethodValue}`);
    }

    const pgName = pgEntry[0] as Params["pg"]["name"];
    const exactPayMethod = pgOptions[pgName].payMethods.find(
      (method) => method.toLowerCase() === normalizedPayMethod,
    )!;

    return [pgName, exactPayMethod];
  };

  // Nested function to get default pg and payMethod
  const getDefaultPgAndPayMethod = (): [Params["pg"]["name"], string] => {
    const defaultPg = Object.keys(pgOptions)[0] as Params["pg"]["name"];
    const defaultPayMethod = pgOptions[defaultPg].payMethods[0];
    return [defaultPg, defaultPayMethod];
  };

  // Parse smartRouting parameter
  const parsedSmartRouting = parseSmartRouting(smartRouting);

  // Handle pg and payMethod parameters
  let pgName: Params["pg"]["name"];
  let selectedPayMethod: string;

  // Case 1: Both pg and payMethod are provided
  if (pg !== null && payMethod !== null) {
    pgName = validatePg(pg);
    selectedPayMethod = validatePayMethodForPg(pgName, payMethod);
  }
  // Case 2: pg is null, payMethod is provided
  else if (pg === null && payMethod !== null) {
    [pgName, selectedPayMethod] = findPgForPayMethod(payMethod);
  }
  // Case 3: pg is provided, payMethod is null
  else if (pg !== null && payMethod === null) {
    pgName = validatePg(pg);
    selectedPayMethod = pgOptions[pgName].payMethods[0];
  }
  // Case 4: Both pg and payMethod are null
  else {
    [pgName, selectedPayMethod] = getDefaultPgAndPayMethod();
  }

  return {
    smartRouting: parsedSmartRouting,
    pg: {
      name: pgName,
      payMethods: selectedPayMethod,
    } as Params["pg"],
  };
}

// 문서에 노출되는 순서대로
export type Sections =
  | "client:import-portone-sdk"
  | "client:fetch-item"
  | "client:request-payment"
  | "client:handle-payment-error"
  | "client:request-server-side-verification"
  | "client:handle-payment-status:paid"
  | "client:handle-payment-status:virtual-account-issued"
  | "client:handle-payment-status:failed"
  | "server:import-portone-sdk"
  | "server:portone-api-secret"
  | "server:complete-payment"
  | "server:complete-payment:get-payment"
  | "server:complete-payment:verify-payment"
  | "server:webhook"
  | "server:webhook:raw-body"
  | "server:webhook:verify"
  | "server:webhook:complete-payment";
