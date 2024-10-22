export interface Tag {
  name: string;
  description: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  invisible?: boolean;
  children?: Category[];
}

export function tagsToCategories(tags: Tag[]): Category[] {
  return tags.map(({ name, description }) => ({
    id: name,
    title: name,
    description,
  }));
}

export function getCategories(schema: unknown): Category[] {
  const s = schema as {
    "x-portone-categories"?: Category[];
    info?: {
      "x-portone-categories"?: Category[];
    };
    tags?: Tag[];
  };

  const filterInvisible = (categories: Category[] | undefined) =>
    categories?.filter((category) => !category.invisible);

  return (
    filterInvisible(s["x-portone-categories"]) ||
    filterInvisible(s.info?.["x-portone-categories"]) ||
    tagsToCategories(s.tags || [])
  );
}

export function flatCategories(categories: Category[]): Category[] {
  return categories
    .map((category) => {
      if (category.children) return [category, ...category.children];
      return category;
    })
    .flat();
}
