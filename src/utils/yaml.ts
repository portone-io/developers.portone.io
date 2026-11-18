import { CORE_SCHEMA, load, timestampTag } from "js-yaml";

const schema = CORE_SCHEMA.withTags(timestampTag);

export function loadYaml(source: string): unknown {
  return load(source, { schema });
}
