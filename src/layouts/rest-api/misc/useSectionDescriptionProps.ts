type SectionDescriptionPropsOf<T extends Record<string, unknown>> = {
  [K in keyof T as K extends `section:${infer InnerK}` ? InnerK : never]: T[K];
} & {};

export default function useSectionDescriptionProps<
  T extends Record<string, unknown>,
>(props: T): SectionDescriptionPropsOf<T> {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("section:"))
      .map(([key, value]) => [key.slice("section:".length), value]),
  ) as SectionDescriptionPropsOf<T>;
}
