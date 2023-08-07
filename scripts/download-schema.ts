#!/usr/bin/env -S deno run -A

import { ensureFile } from "https://deno.land/std@0.197.0/fs/ensure_file.ts";
import { parse as parseYaml } from "https://deno.land/std@0.197.0/yaml/mod.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.3/prompt/input.ts";
import {
  pollToken,
  requestCode,
  writeGhHosts,
} from "https://deno.land/x/pbkit@v0.0.61/misc/github/auth.ts";
import { getToken } from "https://deno.land/x/pbkit@v0.0.61/misc/github/index.ts";
import { open } from "https://deno.land/x/pbkit@v0.0.61/misc/browser.ts";

if (!import.meta.main) Deno.exit(1);

const schemas = ["V1 OpenAPI", "V2 OpenAPI", "V2 GraphQL"] as const;
type Schema = (typeof schemas)[number];
const downloadFns: { [key in Schema]: () => Promise<void> } = {
  "V1 OpenAPI": downloadV1Openapi,
  "V2 OpenAPI": downloadV2Openapi,
  "V2 GraphQL": downloadV2Graphql,
};

const schema = await Input.prompt({
  message: "내려받을 스키마를 선택해주세요.",
  default: schemas[0],
  list: true,
  info: true,
  suggestions: schemas as unknown as Schema[],
}) as Schema;

async function downloadV1Openapi() {
  console.log(`스키마 위치: ${downloadV1Openapi.src}`);
  console.log(`저장할 위치: ${downloadV1Openapi.dst}`);
  console.log("내려받는 중...");
  const res = await fetch(downloadV1Openapi.src);
  const schema = await res.json();
  const json = JSON.stringify(schema);
  await touchAndSaveText(downloadV1Openapi.dst, json);
  console.log("완료");
}
downloadV1Openapi.src = "https://api.iamport.kr/api/docs";
downloadV1Openapi.dst = import.meta.resolve("../public/schema/v1.openapi.json");

async function downloadV2Openapi() {
  const token = await ensureLoggedIn();
  console.log(`스키마 위치: ${downloadV2Openapi.src}`);
  console.log(`저장할 위치: ${downloadV2Openapi.dst}`);
  console.log("내려받는 중...");
  const yaml = await fetchTextFromGithub(downloadV2Openapi.src, token);
  const json = JSON.stringify(parseYaml(yaml));
  await touchAndSaveText(downloadV2Openapi.dst, json);
  console.log("완료");
}
downloadV2Openapi.src =
  "https://raw.githubusercontent.com/portone-io/public-api-service/main/schema/openapi.yml";
downloadV2Openapi.dst = import.meta.resolve("../public/schema/v2.openapi.json");

async function downloadV2Graphql() {
  const token = await ensureLoggedIn();
  console.log(`스키마 위치: ${downloadV2Graphql.src}`);
  console.log(`저장할 위치: ${downloadV2Graphql.dst}`);
  console.log("내려받는 중...");
  const graphql = await fetchTextFromGithub(downloadV2Graphql.src, token);
  await touchAndSaveText(downloadV2Graphql.dst, graphql);
  console.log("완료");
}
downloadV2Graphql.src =
  "https://raw.githubusercontent.com/portone-io/public-api-service/main/schema/schema.graphql";
downloadV2Graphql.dst = import.meta.resolve("../public/schema/v2.graphql");

if (schema in downloadFns) await downloadFns[schema]();
else {
  console.log("지원하지 않는 스키마입니다.");
  Deno.exit(1);
}

async function touchAndSaveText(resolvedPath: string, text: string) {
  const url = new URL(resolvedPath);
  await ensureFile(url);
  await Deno.writeTextFile(url, text);
}

async function fetchTextFromGithub(url: string, token: string) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.v3.raw",
      Authorization: `token ${token}`,
    },
  });
  return await res.text();
}

async function ensureLoggedIn() {
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
