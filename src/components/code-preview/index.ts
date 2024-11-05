import type { CodeFunction, CodeResult } from "./code";

export { code } from "./code";

export type Tab<Params extends object, Sections extends string> = {
  fileName: string;
  code: CodeFunction<Params, CodeResult<Sections>>;
};

export function mergeTabs<
  Params extends object,
  Sections1 extends string,
  Sections2 extends string,
>(
  tabs1: readonly Tab<Params, Sections1>[],
  tabs2: readonly Tab<Params, Sections2>[],
) {
  return [...tabs1, ...tabs2] as Tab<Params, Sections1 | Sections2>[];
}
