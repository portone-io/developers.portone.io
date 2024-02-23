import type { OpenApiSchema } from ".";

export interface Tag {
  name: string;
  description: string;
}

export interface Category {
  id: string;
  title: string;
  description?: string;
  children?: Category[];
}

export function tagsToCategories(tags: Tag[]): Category[] {
  return tags.map(({ name, description }) => ({
    id: name,
    title: name,
    description,
  }));
}

export function getCategories(schema: OpenApiSchema): Category[] {
  return (
    schema["x-portone-categories"] ||
    schema.info?.["x-portone-categories"] ||
    tagsToCategories(schema.tags || [])
  );
}

export function flatCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => {
    if (category.children) return [category, ...category.children];
    return category;
  });
}
