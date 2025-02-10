function Writer(indent: string) {
  return {
    content: "",
    level: 0,
    indent() {
      this.level += 1;
    },
    outdent() {
      this.level -= 1;
    },
    writeLine(line: string) {
      this.content += (indent.repeat(this.level) + line).trimEnd();
      this.content += "\n";
    },
  };
}
export type Writer = ReturnType<typeof Writer>;

export function TypescriptWriter() {
  return Writer("  ");
}
