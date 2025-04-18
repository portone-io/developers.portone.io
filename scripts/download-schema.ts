#!/usr/bin/env -S deno run -A

import { open } from "https://deno.land/x/pbkit@v0.0.70/misc/browser.ts";
import {
  pollToken,
  requestCode,
  writeGhHosts,
} from "https://deno.land/x/pbkit@v0.0.70/misc/github/auth.ts";
import { getToken } from "https://deno.land/x/pbkit@v0.0.70/misc/github/index.ts";
import { Input } from "jsr:@cliffy/prompt@1.0.0-rc.5/input";
import { render as renderGfm } from "jsr:@deno/gfm@0.9.0";
import { ensureFile } from "jsr:@std/fs@1.0.2/ensure-file";
import {
  parse as parseYaml,
  stringify as stringifyYaml,
} from "jsr:@std/yaml@1.0.4";

const mdProperties = new Set([
  "summary",
  "description",
  "x-portone-summary",
  "x-portone-description",
]);

const schemas = ["V1 OpenAPI", "V2 OpenAPI", "V2 GraphQL"] as const;
type Schema = (typeof schemas)[number];
const downloadFns: { [key in Schema]: () => Promise<void> } = {
  "V1 OpenAPI": downloadV1Openapi,
  "V2 OpenAPI": downloadV2Openapi,
  "V2 GraphQL": downloadV2Graphql,
};

if (import.meta.main) {
  const schema = (await Input.prompt({
    message: "내려받을 스키마를 선택해주세요.",
    default: schemas[0],
    list: true,
    info: true,
    suggestions: schemas as unknown as Schema[],
  })) as Schema;
  if (schema in downloadFns) await downloadFns[schema]();
  else {
    console.log("지원하지 않는 스키마입니다.");
    Deno.exit(1);
  }
}

export function processV1Openapi(schema: any): any {
  traverseEveryProperty(schema, (node, property, context) => {
    if (property === "x-portone-per-pg") {
      context.renderAll = true;
      return;
    }
    if (typeof node[property] !== "string") return;
    if (!mdProperties.has(property)) return;
    if (!context.renderAll && !property.startsWith("x-")) return;
    node[property] = renderGfm(node[property]);
  });
  return schema;
}

export async function downloadV1Openapi() {
  const src = "https://api.iamport.kr/api/docs";
  // const src = "https://core-api.stg.iamport.co/api/docs";
  const jsonDst = import.meta.resolve("../src/schema/v1.openapi.json");
  const yamlDst = import.meta.resolve("../src/schema/v1.openapi.yml");
  console.log(`스키마 위치: ${src}`);
  console.log(`저장할 위치 (JSON): ${jsonDst}`);
  console.log(`저장할 위치 (YAML): ${yamlDst}`);
  console.log("내려받는 중...");
  const res = await fetch(src);
  const schema = processV1Openapi(await res.json());
  const json = JSON.stringify(schema, null, 2);

  // src 디렉터리에 JSON 저장
  await touchAndSaveText(jsonDst, json);

  // src 디렉터리에 YAML 저장 (JSON을 YAML로 변환)
  const yaml = stringifyYaml(schema);
  await touchAndSaveText(yamlDst, yaml);

  console.log("완료");
}

export function processV2Openapi(schema: any): any {
  schema.servers = (schema.servers as { url: string }[]).filter(
    (server) => !server.url.endsWith(".iamport.co"),
  );
  schema["x-portone-categories"] = filterCategories(
    schema["x-portone-categories"],
  );
  const categories = collectCategoryIds(schema["x-portone-categories"]);
  traverseEveryProperty(schema, (node, property) => {
    if (!node[property]) return;
    if (node[property]["x-portone-hidden"]) {
      delete node[property];
      return;
    }
    const category = node[property]["x-portone-category"];
    if (typeof category === "string" && !categories.has(category)) {
      delete node[property];
      return;
    }
  });
  traverseEveryProperty(schema, (node, property) => {
    if (property !== "x-portone-fields") return;
    node.properties ||= {};
    for (const field in node["x-portone-fields"]) {
      Object.assign(
        (node.properties[field] ||= {}),
        node["x-portone-fields"][field],
      );
    }
    delete node["x-portone-fields"];
  });
  for (const [key, value] of Object.entries(schema.paths)) {
    if (value == null || Object.keys(value).length === 0) {
      delete schema.paths[key];
    }
  }
  return schema;
}

export async function downloadV2Openapi() {
  const src =
    "https://raw.githubusercontent.com/portone-io/public-api-service/main/schema/openapi.yml";
  const jsonDst = import.meta.resolve("../src/schema/v2.openapi.json");
  const yamlDst = import.meta.resolve("../src/schema/v2.openapi.yml");
  const token = await ensureLoggedIn();
  console.log(`스키마 위치: ${src}`);
  console.log(`저장할 위치 (src JSON): ${jsonDst}`);
  console.log(`저장할 위치 (src YAML): ${yamlDst}`);
  console.log("내려받는 중...");
  const yaml = await fetchTextFromGithub(src, token);

  // YAML 파싱 및 처리
  const processedSchema = processV2Openapi(parseYaml(yaml));

  // 처리된 스키마를 JSON과 YAML로 변환
  const processedJson = JSON.stringify(processedSchema, null, 2);
  const processedYaml = stringifyYaml(processedSchema);

  // src 디렉터리에 JSON 저장
  await touchAndSaveText(jsonDst, processedJson);

  // src 디렉터리에 YAML 저장
  await touchAndSaveText(yamlDst, processedYaml);

  console.log("완료");
}

export async function downloadV2Graphql() {
  const src =
    "https://raw.githubusercontent.com/portone-io/public-api-service/main/schema/schema.graphql";
  const dst = import.meta.resolve("../src/schema/v2.graphql");
  const token = await ensureLoggedIn();
  console.log(`스키마 위치: ${src}`);
  console.log(`저장할 위치 (src): ${dst}`);
  console.log("내려받는 중...");
  const graphql = await fetchTextFromGithub(src, token);

  // src 디렉터리에 저장
  await touchAndSaveText(dst, graphql);

  console.log("완료");
}

export async function touchAndSaveText(resolvedPath: string, text: string) {
  const url = new URL(resolvedPath);
  await ensureFile(url);
  await Deno.writeTextFile(url, text);
}

export async function fetchTextFromGithub(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3.raw",
      Authorization: `token ${token}`,
    },
  });
  return await res.text();
}

export async function ensureLoggedIn() {
  try {
    const token = await getToken();
    return token;
  } catch {
    const code = await requestCode();
    console.log(`1. 우측의 OTP 코드를 복사해주세요: ${code.userCode}`);
    console.log(
      "2. <Enter> 키를 입력하면 웹브라우저에서 OTP 인증 화면으로 이동합니다.",
    );
    await Deno.stdin.read(new Uint8Array(1));
    const { success } = await open(code.verificationUri);
    if (!success) {
      console.log(
        "브라우저를 실행하는데 실패했습니다. 아래 URL로 직접 이동해주세요.",
      );
      console.log(code.verificationUri);
    }
    const pollTokenResult = await pollToken(code);
    await writeGhHosts(pollTokenResult.accessToken);
    console.log("로그인 되었습니다.");
    return pollTokenResult.accessToken;
  }
}

export function traverseEveryProperty(
  object: any,
  fn: (node: any, property: string, context: any) => void,
  context: any = {},
) {
  if (!object) return;
  if (typeof object !== "object") return;
  if (Array.isArray(object)) {
    for (const item of object) traverseEveryProperty(item, fn, context);
  } else {
    for (const property in object) {
      const subcontext = { ...context };
      fn(object, property, subcontext);
      traverseEveryProperty(object[property], fn, subcontext);
    }
  }
}

function filterCategories(list: any[]): any[] {
  return list
    .filter((object) => object.invisible !== true)
    .map((object) => {
      if (Array.isArray(object.children)) {
        return {
          ...object,
          children: filterCategories(object.children),
        };
      }
      return object;
    });
}

function collectCategoryIds(
  object: any,
  list = new Set<string>(),
): Set<string> {
  if (typeof object === "object") {
    if (Array.isArray(object)) {
      for (const item of object) collectCategoryIds(item, list);
    } else {
      list.add(object.id);
      collectCategoryIds(object.children, list);
    }
  }
  return list;
}
