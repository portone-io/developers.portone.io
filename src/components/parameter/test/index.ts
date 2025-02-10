import { lazy } from "solid-js";

export const browserSdk = {
  "#/resources/entity/Address": {
    typeDef: lazy(() =>
      import("./Address/Address").then(({ TypeDef }) => ({ default: TypeDef })),
    ),
    type: lazy(() =>
      import("./Address/Address").then(({ Type }) => ({ default: Type })),
    ),
  },
  "#/resources/entity/Country": {
    typeDef: lazy(() =>
      import("./Country/Country").then(({ TypeDef }) => ({ default: TypeDef })),
    ),
    type: lazy(() =>
      import("./Country/Country").then(({ Type }) => ({ default: Type })),
    ),
  },
};
