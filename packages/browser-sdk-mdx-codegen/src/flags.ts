import { match, P } from "ts-pattern";

import { type Parameter } from "./schema.ts";

/**
 * Check if a parameter is visible for a flag
 */
export function isVisibleForFlag(parameter: Parameter, flag: string): boolean {
  if (!parameter.flagOptions || !parameter.flagOptions[flag]) {
    return true;
  }
  return parameter.flagOptions[flag].visible === true;
}

/**
 * Check if an object type would be empty for a flag
 */
export function isEmptyForFlag(parameter: Parameter, flag: string): boolean {
  return match(parameter)
    .with({ properties: P.nonNullable }, (parameter) => {
      return Object.values(parameter.properties).every(
        (prop) => !isVisibleForFlag(prop, flag),
      );
    })
    .with({ types: P.array() }, (parameter) => {
      return parameter.types.every((type) => isEmptyForFlag(type, flag));
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
      return Object.values(parameter.types).every((type) =>
        isEmptyForFlag(type, flag),
      );
    })
    .with({ type: "array", items: P.nonNullable }, (parameter) => {
      return isEmptyForFlag(parameter.items, flag);
    })
    .otherwise(() => false);
}

/**
 * Get all flags that have explicit visibility settings
 */
export function getExplicitlyVisibleFlags(parameter: Parameter): string[] {
  const visibleFlags = new Set<string>();

  function collectVisibleFlags(param: Parameter) {
    if (param.flagOptions) {
      Object.entries(param.flagOptions).forEach(([flag, spec]) => {
        if (spec.visible === true) {
          visibleFlags.add(flag);
        }
      });
    }

    match(param)
      .with({ properties: P.nonNullable }, (param) => {
        Object.values(param.properties).forEach(collectVisibleFlags);
      })
      .with({ types: P.array() }, (param) => {
        param.types.forEach(collectVisibleFlags);
      })
      .with({ type: "discriminatedUnion" }, (param) => {
        Object.values(param.types).forEach(collectVisibleFlags);
      })
      .with({ type: "array", items: P.nonNullable }, (param) => {
        collectVisibleFlags(param.items);
      })
      .otherwise(() => {
        return;
      });
  }

  collectVisibleFlags(parameter);
  return Array.from(visibleFlags);
}

/**
 * Check if a parameter has any fields without flagOptions restrictions
 */
export function hasFieldsWithoutFlagOptions(parameter: Parameter): boolean {
  return match(parameter)
    .with({ properties: P.nonNullable }, (parameter) => {
      return Object.values(parameter.properties).some(
        (prop) =>
          !prop.flagOptions || Object.keys(prop.flagOptions).length === 0,
      );
    })
    .with({ types: P.array() }, (parameter) => {
      return parameter.types.some(hasFieldsWithoutFlagOptions);
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
      return Object.values(parameter.types).some(hasFieldsWithoutFlagOptions);
    })
    .with({ type: "array", items: P.nonNullable }, (parameter) => {
      return hasFieldsWithoutFlagOptions(parameter.items);
    })
    .otherwise(() => false);
}

/**
 * Get flags where the object would not be empty
 */
export function getNonEmptyFlags(parameter: Parameter): string[] | null {
  if (!("hideIfEmpty" in parameter) || !parameter.hideIfEmpty) {
    return null;
  }

  if (hasFieldsWithoutFlagOptions(parameter)) {
    return null;
  }

  return getExplicitlyVisibleFlags(parameter).filter(
    (flag) => !isEmptyForFlag(parameter, flag),
  );
}
