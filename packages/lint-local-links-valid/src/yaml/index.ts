import path from "node:path";

import { type Document, LineCounter, type Node, parseDocument } from "yaml";

export { rule as navLocalLinksValid } from "./nav.ts";
export { rule as redirLocalLinksValid } from "./redir.ts";

export interface YamlLintMessage {
  message: string;
  /** 1부터 시작하는 줄/열 번호 */
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export interface YamlRuleContext {
  /** 검사 중인 파일의 절대 경로 */
  filePath: string;
  doc: Document.Parsed;
  report: (node: Node, message: string) => void;
}

export type YamlRule = (context: YamlRuleContext) => void;

/** YAML 소스를 파싱해 rule을 실행합니다. 파싱에 실패하면 첫 번째 오류를 던집니다. */
export function lintYaml(
  code: string,
  filePath: string,
  rule: YamlRule,
): YamlLintMessage[] {
  const lineCounter = new LineCounter();
  const doc = parseDocument(code, { lineCounter });
  const [error] = doc.errors;
  if (error) throw error;

  const messages: YamlLintMessage[] = [];
  rule({
    filePath: path.resolve(filePath),
    doc,
    report(node, message) {
      const [start, end] = node.range ?? [0, 0];
      const startPos = lineCounter.linePos(start);
      const endPos = lineCounter.linePos(end);
      messages.push({
        message,
        line: startPos.line,
        column: startPos.col,
        endLine: endPos.line,
        endColumn: endPos.col,
      });
    },
  });
  return messages.sort((a, b) => a.line - b.line || a.column - b.column);
}
