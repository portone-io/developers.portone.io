import { format, type FormatConfig } from "oxfmt";
import { runAsWorker } from "synckit";

export async function formatCode(
  fileName: string,
  code: string,
  options?: FormatConfig,
) {
  const result = await format(fileName, code, options);
  return {
    code: result.code,
    errors: result.errors.map((error) => error.message),
  };
}

runAsWorker(formatCode);
