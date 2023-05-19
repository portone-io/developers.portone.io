import { P, match } from "ts-pattern";
import type { Lang } from "~/type";
import type { PgProviderID } from "~/consts";
import type { SDKParam } from ".";

export type ParamPatch =
  | {
      type: "add-param";
      path?: string;
      position?: { before: string } | { after: string } | { at: number };
      param: SDKParam;
    }
  | {
      type: "add-pg-specific-enum";
      path: string;
      pgProvider: PgProviderID;
      values: string[];
    }
  | {
      type: "add-pg-specific-description";
      path: string;
      pgProvider: PgProviderID;
      description: Record<Lang, string>;
    }
  | {
      type: "add-requireness-check";
      path: string;
      pgProvider: PgProviderID;
      check: (params: Record<string, unknown>) => string;
    };

export const applyPatches = (root: SDKParam[], patches: ParamPatch[]) => {
  for (const patch of patches) {
    switch (patch.type) {
      case "add-param": {
        const target = match(patch)
          .with({ path: P.select(P.string) }, (path) => {
            const field = accessPath(root, path);
            if (!field) throw new Error(`Cannot find a field at path: ${path}`);
            if (field.type.type !== "object") {
              throw new Error(
                `Cannot add a param to a non-object field: ${path}`
              );
            }
            return field.type.fields;
          })
          .otherwise(() => root);
        if (target.some((param) => param.name === patch.param.name)) {
          throw new Error(
            `Cannot add a param with the same name: ${patch.param.name}`
          );
        }
        const index = match(patch.position)
          .with({ before: P.select(P.string) }, (before) => {
            for (let i = 0; i < target.length; i++) {
              if (target[i]?.name === before) return i;
            }
            throw new Error(
              `Cannot find a field to add a field before: ${before}`
            );
          })
          .with({ after: P.select(P.string) }, (after) => {
            for (let i = 0; i < target.length; i++) {
              if (target[i]?.name === after) return i + 1;
            }
            throw new Error(
              `Cannot find a field to add a field after: ${after}`
            );
          })
          .with({ at: P.select(P.number) }, (at) => at)
          .with(P.nullish, () => target.length)
          .exhaustive();
        target.splice(index, 0, patch.param);
        break;
      }
      case "add-pg-specific-enum": {
        const field = accessPath(root, patch.path);
        if (!field) {
          throw new Error(`Cannot find a field at path: ${patch.path}`);
        }
        if (field.type.type !== "enum") {
          throw new Error(
            `Cannot add a PG-specific enum to a non-enum field: ${patch.path}`
          );
        }
        if (!field.type.pgSpecifics) field.type.pgSpecifics = {};
        field.type.pgSpecifics[patch.pgProvider] = patch.values;
        break;
      }
      case "add-pg-specific-description": {
        const field = accessPath(root, patch.path);
        if (!field) {
          throw new Error(`Cannot find a field at path: ${patch.path}`);
        }
        if (!field.description.pgSpecifics) field.description.pgSpecifics = {};
        field.description.pgSpecifics[patch.pgProvider] = patch.description;
        break;
      }
      case "add-requireness-check": {
        const field = accessPath(root, patch.path);
        if (!field) {
          throw new Error(`Cannot find a field at path: ${patch.path}`);
        }
        field.requirenessChecks.push((params) => ({
          pg: patch.pgProvider,
          message: patch.check(params),
        }));
      }
    }
  }
};

const accessPath = (fields: SDKParam[], path: string) => {
  const parts = path.split(".");
  let current = fields;
  for (let i = 0; i < parts.length; i++) {
    const field = current.find((param) => param.name === parts[i]);
    if (i === parts.length - 1) return field;
    if (field?.type.type !== "object") return undefined;
    current = field.type.fields;
  }
  throw new Error(`Unreachable in accessPath`);
};
