import { getCollection } from "astro:content";

export async function getApiSectionDescriptions() {
  const entries = await getCollection("api-section-description");
  const result = Object.fromEntries(
    await Promise.all(
      entries.map(async (entry) => [entry.slug, await entry.render()] as const)
    )
  );
  return result as {
    [key in (typeof entries)[number]["slug"]]: (typeof result)[key];
  };
}
