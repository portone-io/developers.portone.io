import { md } from "tagged-md";
import type { PgProviderID } from "~/consts";
import type { Lang } from "~/type";

type SDKParamType =
  | { type: "string" }
  | { type: "boolean" }
  | { type: "number" }
  | {
      type: "enum";
      values: string[];
      pgSpecifics?: Record<string, string[]>;
    }
  | { type: "object"; fields: SDKParam[] }
  | { type: "array"; elementType: SDKParamType };

export type SDKParam = {
  name: string;
  type: SDKParamType;
  description: {
    common: Record<Lang, string>;
    pgSpecifics?: Record<string, Record<Lang, string>>;
  };
  requirenessChecks: ((
    params: Record<string, unknown>
  ) => boolean | string | { pg: PgProviderID; message: string })[];
};

export const PARAMS: SDKParam[] = [
  {
    name: "pg" as const,
    type: { type: "string" },
    description: {
      common: {
        ko: md`
          사용할 PG사 모듈과 상점 ID의 구분코드입니다.

          다음과 같은 형식으로 기재합니다.

          **\`{PG사 모듈 코드}.{상점 ID}\`**
        `,
        en: md`
          The identifier of the PG module and the store ID to use.

          Should be written in the following format.

          **\`{PG module identifier}.{Store ID}\`**
        `,
      },
    },
    requirenessChecks: [() => true],
  },
];
