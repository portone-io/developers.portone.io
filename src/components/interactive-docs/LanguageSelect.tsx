import clsx from "clsx";
import { For } from "solid-js";

interface LanguageSelectProps {
  title: string;
  languages: string[];
  selectedLanguage: string;
  onChange: (language: string) => void;
}

export default function LanguageSelect(props: LanguageSelectProps) {
  return (
    <ul class="flex items-center gap-1">
      <li class="rounded-md bg-[#E5E7EB] px-2.5 py-.75 text-xs color-slate-5 font-medium">
        {props.title}
      </li>
      <For each={props.languages}>
        {(language) => (
          <li class="flex">
            <button
              class={clsx(
                "rounded-md px-2.5 py-.75 text-xs color-slate-5 font-medium border cursor-pointer",
                language === props.selectedLanguage && "border-[#09090B]",
              )}
              onClick={() => props.onChange(language)}
            >
              {language}
            </button>
          </li>
        )}
      </For>
    </ul>
  );
}
