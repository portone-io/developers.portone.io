import { ToggleGroup } from "@kobalte/core/toggle-group";
import { createMemo, untrack } from "solid-js";
import { For } from "solid-js";
import { match, P } from "ts-pattern";

import { useInteractiveDocs } from "~/state/interactive-docs";

interface LanguageSelectProps {
  title: string;
  languages: ["frontend", "hybrid"] | "backend";
}

export default function LanguageSelect(props: LanguageSelectProps) {
  const { languages, selectedLanguage, setSelectedLanguage } =
    useInteractiveDocs();
  const value = createMemo(() => {
    const selected = selectedLanguage();
    return match([props.languages, selected])
      .with(
        [
          ["frontend", "hybrid"],
          [P.select(P.string), P.string],
        ],
        (value) => value,
      )
      .with([["frontend", "hybrid"], P.select(P.string)], (value) => value)
      .with(["backend", [P.string, P.select(P.string)]], (value) => value)
      .with(["backend", P.string], () => undefined)
      .exhaustive();
  });
  const languagesValue = createMemo(() => {
    return match(props.languages)
      .with(["frontend", "hybrid"], () => {
        return [...languages().frontend, ...languages().hybrid];
      })
      .with("backend", () => {
        return languages().backend;
      })
      .exhaustive();
  });
  const handleChange = (language: string | null) => {
    if (!language) return;
    const { frontend, backend, hybrid } = untrack(() => languages());
    if (untrack(() => hybrid).includes(language)) {
      setSelectedLanguage(language);
      return;
    }
    setSelectedLanguage((prev) => {
      return match([props.languages, prev])
        .with([["frontend", "hybrid"], P.array()], () => {
          return [language, prev[1]] satisfies [string, string];
        })
        .with([["frontend", "hybrid"], P.string], () => {
          return [language, backend[0]] satisfies [string, string];
        })
        .with(["backend", P.array()], () => {
          return [prev[0], language] satisfies [string, string];
        })
        .with(["backend", P.string], () => {
          return [frontend[0], language] satisfies [string, string];
        })
        .exhaustive();
    });
  };
  return (
    <ToggleGroup
      class="flex items-center gap-2"
      value={value()}
      onChange={handleChange}
    >
      <div class="rounded-md text-xs text-slate-5 font-medium">
        {props.title}
      </div>
      <For each={languagesValue()}>
        {(language) => (
          <ToggleGroup.Item
            value={language}
            class="cursor-pointer border rounded-md px-2.5 py-.75 text-xs color-slate-5 font-medium data-[pressed]:border-[#09090B]"
          >
            {language}
          </ToggleGroup.Item>
        )}
      </For>
    </ToggleGroup>
  );
}
