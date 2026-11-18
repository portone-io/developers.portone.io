import fastDiff from "fast-diff";
import type { Code } from "mdast";
import type { VFile } from "vfile";

type VFileMessage = VFile["messages"][number];

export interface Edit {
  start: number;
  end: number;
  text: string;
}

/**
 * 코드 블록 내용만 `formatted`로 교체하는 수정 사항을 만듭니다.
 *
 * JSX나 리스트 안에 들여쓴 코드 블록은 펜스 줄의 들여쓰기를 각 줄에 다시 붙입니다.
 * 들여쓰기가 공백이 아니거나(예: 인용문) 닫는 펜스가 없으면 수정하지 않습니다.
 */
export function createCodeBlockEdit(
  source: string,
  node: Pick<Code, "position">,
  formatted: string,
): Edit | null {
  const start = node.position?.start;
  const end = node.position?.end;
  if (start?.offset == null || end?.offset == null) return null;

  const lineStart = source.lastIndexOf("\n", start.offset - 1) + 1;
  const indent = source.slice(lineStart, start.offset);
  if (!/^[ \t]*$/.test(indent)) return null;

  const contentStart = source.indexOf("\n", start.offset) + 1;
  const closingLineStart = source.lastIndexOf("\n", end.offset - 1) + 1;
  if (contentStart <= 0 || closingLineStart < contentStart) return null;
  const closingFence = source.slice(closingLineStart, end.offset).trim();
  if (!/^(`{3,}|~{3,})$/.test(closingFence)) return null;

  const text = formatted
    .split("\n")
    .map((line) => (line ? indent + line : line))
    .join("\n");
  return { start: contentStart, end: closingLineStart, text: `${text}\n` };
}

interface Difference {
  offset: number;
  deleteText: string;
  insertText: string;
}

function getDifferences(source: string, fixed: string): Difference[] {
  const differences: Difference[] = [];
  let offset = 0;
  let current: Difference | null = null;
  for (const [operation, text] of fastDiff(source, fixed)) {
    if (operation === fastDiff.EQUAL) {
      if (current) differences.push(current);
      current = null;
      offset += text.length;
      continue;
    }
    current ??= { offset, deleteText: "", insertText: "" };
    if (operation === fastDiff.DELETE) {
      current.deleteText += text;
      offset += text.length;
    } else {
      current.insertText += text;
    }
  }
  if (current) differences.push(current);
  return differences;
}

/**
 * remark-stringify 결과와 원본의 차이 중 lint 메시지 위치와 겹치는 부분만 수정 사항으로
 * 만듭니다. 기존 `eslint-plugin-mdx`의 `mdx/remark` 자동 수정과 같은 방식입니다.
 */
export function createStringifyEdits(
  source: string,
  stringified: string,
  messages: Pick<VFileMessage, "place">[],
): Edit[] {
  if (source === stringified) return [];
  const differences = getDifferences(source, stringified);
  const edits = new Map<number, Edit>();
  for (const { place } of messages) {
    if (!place) continue;
    const start = "start" in place ? place.start : place;
    const end = "start" in place ? place.end : place;
    if (start.offset == null || end.offset == null) continue;
    for (const { offset, deleteText, insertText } of differences) {
      if (offset <= end.offset && offset + deleteText.length >= start.offset) {
        edits.set(offset, {
          start: offset,
          end: offset + deleteText.length,
          text: insertText,
        });
      }
    }
  }
  return [...edits.values()];
}

/** 서로 겹치지 않는 수정 사항만 앞에서부터 적용합니다. */
export function applyEdits(source: string, edits: Edit[]): string {
  const sorted = [...edits].sort((a, b) => a.start - b.start || a.end - b.end);
  let result = "";
  let cursor = 0;
  for (const edit of sorted) {
    if (edit.start < cursor) continue;
    result += source.slice(cursor, edit.start) + edit.text;
    cursor = edit.end;
  }
  return result + source.slice(cursor);
}
