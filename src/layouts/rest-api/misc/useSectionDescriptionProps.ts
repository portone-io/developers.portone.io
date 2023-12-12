export default function useSectionDescriptionProps(props: any) {
  return Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => key.startsWith("section:"))
      .map(([key, value]) => [key.slice("section:".length), value])
  );
}
