import type { CodeExample } from "~/state/interactive-docs/index.jsx";

import type { Params, Sections } from "../../type.js";
import PaymentController from "./PaymentController.kt";
import PortOneSecretProperties from "./PortOneSecretProperties.kt";
import ServerApplication from "./ServerApplication.kt";
import SyncPaymentException from "./SyncPaymentException.kt";

export const files = [
  {
    fileName: "PaymentController.kt",
    code: PaymentController,
    language: "kotlin",
  },
  {
    fileName: "ServerApplication.kt",
    code: ServerApplication,
    language: "kotlin",
  },
  {
    fileName: "PortOneSecretProperties.kt",
    code: PortOneSecretProperties,
    language: "kotlin",
  },
  {
    fileName: "SyncPaymentException.kt",
    code: SyncPaymentException,
    language: "kotlin",
  },
] as const satisfies CodeExample<Params, Sections>[];
