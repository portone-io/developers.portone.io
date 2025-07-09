import { match, P } from "ts-pattern";

import { type Parameter } from "./schema.ts";

/**
 * Check if a parameter is visible for a specific payment gateway
 */
export function isVisibleForPg(parameter: Parameter, pg: string): boolean {
  if (!parameter.pgSpecific || !parameter.pgSpecific[pg]) {
    return true;
  }
  return parameter.pgSpecific[pg].visible === true;
}

/**
 * Check if an object type would be empty for a specific payment gateway
 */
export function isEmptyForPg(parameter: Parameter, pg: string): boolean {
  return match(parameter)
    .with({ properties: P.nonNullable }, (parameter) => {
      return Object.values(parameter.properties).every(
        (prop) => !isVisibleForPg(prop, pg),
      );
    })
    .with({ types: P.array() }, (parameter) => {
      return parameter.types.every((type) => isEmptyForPg(type, pg));
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
      return Object.values(parameter.types).every((type) =>
        isEmptyForPg(type, pg),
      );
    })
    .with({ type: "array", items: P.nonNullable }, (parameter) => {
      return isEmptyForPg(parameter.items, pg);
    })
    .otherwise(() => false);
}

/**
 * Get all payment gateways that have explicit visibility settings
 */
export function getExplicitlyVisiblePgs(parameter: Parameter): string[] {
  const visiblePgs = new Set<string>();

  function collectVisiblePgs(param: Parameter) {
    if (param.pgSpecific) {
      Object.entries(param.pgSpecific).forEach(([pg, spec]) => {
        if (spec.visible === true) {
          visiblePgs.add(pg);
        }
      });
    }

    match(param)
      .with({ properties: P.nonNullable }, (param) => {
        Object.values(param.properties).forEach(collectVisiblePgs);
      })
      .with({ types: P.array() }, (param) => {
        param.types.forEach(collectVisiblePgs);
      })
      .with({ type: "discriminatedUnion" }, (param) => {
        Object.values(param.types).forEach(collectVisiblePgs);
      })
      .with({ type: "array", items: P.nonNullable }, (param) => {
        collectVisiblePgs(param.items);
      })
      .otherwise(() => {
        return;
      });
  }

  collectVisiblePgs(parameter);
  return Array.from(visiblePgs);
}

/**
 * Check if a parameter has any fields without pgSpecific restrictions
 */
export function hasFieldsWithoutPgSpecific(parameter: Parameter): boolean {
  return match(parameter)
    .with({ properties: P.nonNullable }, (parameter) => {
      return Object.values(parameter.properties).some(
        (prop) => !prop.pgSpecific || Object.keys(prop.pgSpecific).length === 0,
      );
    })
    .with({ types: P.array() }, (parameter) => {
      return parameter.types.some(hasFieldsWithoutPgSpecific);
    })
    .with({ type: "discriminatedUnion" }, (parameter) => {
      return Object.values(parameter.types).some(hasFieldsWithoutPgSpecific);
    })
    .with({ type: "array", items: P.nonNullable }, (parameter) => {
      return hasFieldsWithoutPgSpecific(parameter.items);
    })
    .otherwise(() => false);
}

/**
 * Get payment gateways where the object would not be empty
 */
export function getNonEmptyPgs(parameter: Parameter): string[] | null {
  if (!("hideIfEmpty" in parameter) || !parameter.hideIfEmpty) {
    return null;
  }

  if (hasFieldsWithoutPgSpecific(parameter)) {
    return null;
  }

  return getExplicitlyVisiblePgs(parameter).filter(
    (pg) => !isEmptyForPg(parameter, pg),
  );
}
