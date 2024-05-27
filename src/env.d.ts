/// <reference types="@solidjs/start/env" />

import "@total-typescript/ts-reset/filter-boolean";

declare module "solid-js" {
  namespace JSX {
    interface IntrinsicAttributes {
      "client:idle"?: boolean;
    }
  }
}
