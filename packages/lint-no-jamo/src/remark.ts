import { lintRule } from "unified-lint-rule";
import { visit } from "unist-util-visit";
import * as YAML from "yaml";

const JAMO_REGEX = /[\u1100-\u11FF]/;
const REASON = "자모 문자는 사용할 수 없습니다";

export const remarkLintNoJamo = lintRule(
  "remark-lint:no-jamo",
  (tree, file) => {
    visit(tree, (node) => {
      if (node.type === "yaml" && "value" in node) {
        try {
          const lineCounter = new YAML.LineCounter();
          const doc = YAML.parseDocument(String(node.value), {
            lineCounter,
          });
          YAML.visit(doc, {
            Scalar(_, scalar) {
              if (typeof scalar.value === "string") {
                if (JAMO_REGEX.test(scalar.value)) {
                  const range = scalar.range;
                  if (node.position && range) {
                    const start = lineCounter.linePos(range[0]);
                    const end = lineCounter.linePos(range[1]);
                    file.message(REASON, {
                      ...node,
                      position: {
                        start: {
                          line: node.position.start.line + start.line,
                          column: start.col,
                        },
                        end: {
                          line: node.position.start.line + end.line,
                          column: end.col,
                        },
                      },
                    });
                  } else {
                    file.message(REASON, node);
                  }
                }
              }
            },
          });
        } catch (e) {
          file.message(String(e), node);
        }
      }
      if (node.type === "text" && "value" in node) {
        if (JAMO_REGEX.test(String(node.value))) {
          file.message(REASON, node);
        }
      }
    });
  },
);
