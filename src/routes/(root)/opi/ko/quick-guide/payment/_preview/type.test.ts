import { describe, expect, it } from "vitest";

import { pgOptions, validateParams } from "./type";

describe("validateParams", () => {
  // Valid parameter combinations
  it("should return valid params when pg and payMethod are valid", () => {
    const result = validateParams({
      pg: "toss",
      payMethod: "card",
      smartRouting: "false",
    });
    expect(result).toEqual({
      smartRouting: false,
      pg: {
        name: "toss",
        payMethods: "card",
      },
    });
  });

  // Test all PG options with valid payment methods
  Object.entries(pgOptions).forEach(([pg, options]) => {
    options.payMethods.forEach((payMethod) => {
      it(`should validate ${pg} with ${payMethod}`, () => {
        const result = validateParams({
          pg,
          payMethod,
          smartRouting: "false",
        });
        expect(result).toEqual({
          smartRouting: false,
          pg: {
            name: pg,
            payMethods: payMethod,
          },
        });
      });
    });
  });

  it("should return valid params with smartRouting=true", () => {
    const result = validateParams({
      pg: "nice",
      payMethod: "virtualAccount",
      smartRouting: "true",
    });
    expect(result).toEqual({
      smartRouting: true,
      pg: {
        name: "nice",
        payMethods: "virtualAccount",
      },
    });
  });

  it("should treat null smartRouting as false", () => {
    const result = validateParams({
      pg: "inicis",
      payMethod: "easyPay",
      smartRouting: null,
    });
    expect(result).toEqual({
      smartRouting: false,
      pg: {
        name: "inicis",
        payMethods: "easyPay",
      },
    });
  });

  // Default values for null parameters
  it("should use the first pg supporting the given payMethod when pg is null", () => {
    const availablePayMethods = [
      "card",
      "virtualAccount",
      "easyPay",
      "transfer",
      "mobile",
      "giftCertificate",
    ];

    for (const payMethod of availablePayMethods) {
      // Find the first PG that supports this payment method
      const expectedPg = Object.entries(pgOptions).find(([_, options]) =>
        options.payMethods.some((method) => method === payMethod),
      )?.[0];
      expect(expectedPg).toBeDefined();

      const result = validateParams({
        pg: null,
        payMethod,
        smartRouting: "false",
      });

      expect(result).toEqual({
        smartRouting: false,
        pg: {
          name: expectedPg,
          payMethods: payMethod,
        },
      });
    }
  });

  it("should use first payMethod when payMethod is null", () => {
    const pg = "kakao";
    const firstPayMethod = pgOptions[pg].payMethods[0];
    const result = validateParams({
      pg,
      payMethod: null,
      smartRouting: "false",
    });
    expect(result).toEqual({
      smartRouting: false,
      pg: {
        name: pg,
        payMethods: firstPayMethod,
      },
    });
  });

  it("should handle both pg and payMethod being null", () => {
    const firstPg = Object.keys(pgOptions)[0] as keyof typeof pgOptions;
    const firstPayMethod = pgOptions[firstPg].payMethods[0];
    const result = validateParams({
      pg: null,
      payMethod: null,
      smartRouting: "false",
    });
    expect(result).toEqual({
      smartRouting: false,
      pg: {
        name: firstPg,
        payMethods: firstPayMethod,
      },
    });
  });

  // Invalid parameter combinations
  it("should throw error when pg is not in pgOptions", () => {
    const availablePgs = Object.keys(pgOptions).join(", ");
    expect(() =>
      validateParams({
        pg: "invalid-pg",
        payMethod: "card",
        smartRouting: "false",
      }),
    ).toThrow(`지원하지 않는 pg: invalid-pg. 사용 가능한 pg: ${availablePgs}`);
  });

  it("should throw error when payMethod is not supported by pg", () => {
    const pg = "kakao";
    const availablePayMethods = pgOptions[pg].payMethods.join(", ");
    expect(() =>
      validateParams({
        pg,
        payMethod: "card",
        smartRouting: "false",
      }),
    ).toThrow(
      `해당 pg에서 지원하지 않는 payMethod: card. ${pg}에서 사용 가능한 payMethod: ${availablePayMethods}`,
    );
  });

  it("should throw error when smartRouting is invalid string", () => {
    expect(() =>
      validateParams({
        pg: "toss",
        payMethod: "card",
        smartRouting: "invalid",
      }),
    ).toThrow("smartRouting은 true 또는 false여야 합니다");
  });

  it("should handle case-insensitive pg names", () => {
    const result = validateParams({
      pg: "TOSS",
      payMethod: "card",
      smartRouting: "false",
    });
    expect(result).toEqual({
      smartRouting: false,
      pg: {
        name: "toss",
        payMethods: "card",
      },
    });
  });

  it("should handle case-insensitive payment methods", () => {
    const result = validateParams({
      pg: "kcp",
      payMethod: "CARD",
      smartRouting: "false",
    });
    expect(result).toEqual({
      smartRouting: false,
      pg: {
        name: "kcp",
        payMethods: "card",
      },
    });
  });

  it("should handle case-insensitive smartRouting parameter", () => {
    // Test with uppercase TRUE
    const resultTrue = validateParams({
      pg: "toss",
      payMethod: "card",
      smartRouting: "TRUE",
    });
    expect(resultTrue).toEqual({
      smartRouting: true,
      pg: {
        name: "toss",
        payMethods: "card",
      },
    });

    // Test with mixed case FaLsE
    const resultFalse = validateParams({
      pg: "nice",
      payMethod: "virtualAccount",
      smartRouting: "FaLsE",
    });
    expect(resultFalse).toEqual({
      smartRouting: false,
      pg: {
        name: "nice",
        payMethods: "virtualAccount",
      },
    });
  });
});
