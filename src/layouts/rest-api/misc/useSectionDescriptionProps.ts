type SectionDescriptionProps<T extends Record<string, unknown>> = {
  [K in keyof T & `section:${string}` as K extends `section:${infer U}`
    ? U
    : never]: T[K];
  // eslint-disable-next-line @typescript-eslint/ban-types -- to show expanded types on hover
} & {};

export default function useSectionDescriptionProps<
  T extends Record<string, unknown>,
>(props: T): SectionDescriptionProps<T> {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("section:"))
      .map(([key, value]) => [key.slice("section:".length), value]),
  ) as SectionDescriptionProps<T>;
}
