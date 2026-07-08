import { query } from "@solidjs/router";

import {
  type CategoryData,
  createFallbackCategoryData,
  getNavData,
  getOverviewData,
  loadGeneratedCategoryData,
  type NavData,
  type OverviewGroup,
  type RestApiVersion,
} from "../__generated__";

export const loadNavData = query((version: RestApiVersion): NavData => {
  "use server";
  return getNavData(version);
}, "rest-api/nav-data");

export const loadOverviewData = query(
  (version: RestApiVersion): OverviewGroup[] => {
    "use server";
    return getOverviewData(version);
  },
  "rest-api/overview-data",
);

export const loadCategoryData = query(
  async (
    version: RestApiVersion,
    categoryId: string,
  ): Promise<CategoryData> => {
    "use server";
    return (
      (await loadGeneratedCategoryData(version, categoryId)) ??
      createFallbackCategoryData(categoryId)
    );
  },
  "rest-api/category-data",
);
