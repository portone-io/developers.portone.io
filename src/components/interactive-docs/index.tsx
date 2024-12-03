export { code } from "./code";
import { Switch } from "@kobalte/core/switch";
import {
  type Component,
  createEffect,
  createMemo,
  type ParentComponent,
  type ParentProps,
  Show,
  startTransition,
  untrack,
} from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { match, P } from "ts-pattern";

import {
  type CodeExample,
  type InteractiveDocsInit,
  type PgOptions,
  useInteractiveDocs,
} from "~/state/interactive-docs";

import type { DefaultParams } from "./code";

export type CodeExmapleMap<
  Params extends DefaultParams,
  Sections extends string,
  T extends string,
> = {
  [key in T]: CodeExample<Params, Sections>[];
};

export function createInteractiveDoc<
  Params extends DefaultParams,
  Sections extends string,
  FrontendLanguage extends string,
  BackendLanguage extends string,
  HybridLanguage extends string,
>({
  codeExamples,
  pgOptions,
  initialParams,
  initialSelectedExample,
  preview,
}: {
  codeExamples: {
    frontend: CodeExmapleMap<Params, Sections, FrontendLanguage>;
    backend: CodeExmapleMap<Params, Sections, BackendLanguage>;
    hybrid?: CodeExmapleMap<Params, Sections, HybridLanguage>;
  };
  pgOptions: PgOptions;
  initialParams: NoInfer<Params>;
  initialSelectedExample: NoInfer<
    [frontend: FrontendLanguage, backend: BackendLanguage] | HybridLanguage
  >;
  preview: Component;
}): {
  InteractiveDoc: ParentComponent;
  Section: ParentComponent<{ section?: Sections }>;
  Condition: ParentComponent<{
    when?: (params: Params) => boolean;
    language?:
      | `frontend/${FrontendLanguage}`
      | `backend/${BackendLanguage}`
      | `hybrid/${HybridLanguage}`;
  }>;
  Toggle: ParentComponent<{
    param: {
      [K in keyof Params]: Params[K] extends boolean ? K : never;
    }[keyof Params];
    label: string;
  }>;
  preload: InteractiveDocsInit;
} {
  const InteractiveDoc: ParentComponent = (props) => {
    const { setCodeExamples, setSelectedLanguage, setPreview } =
      useInteractiveDocs();
    void startTransition(() => {
      setCodeExamples(
        codeExamples as unknown as {
          frontend: Record<
            string,
            CodeExample<DefaultParams & object, string>[]
          >;
          backend: Record<
            string,
            CodeExample<DefaultParams & object, string>[]
          >;
          hybrid?: Record<
            string,
            CodeExample<DefaultParams & object, string>[]
          >;
        },
      );
      setSelectedLanguage(initialSelectedExample as [string, string] | string);
      setPreview(() => preview);
    });

    return <>{props.children}</>;
  };
  const Section = (props: ParentProps<{ section?: Sections }>) => {
    const { setCurrentSection, currentSection } = useInteractiveDocs();
    let ref: HTMLDivElement;
    createEffect(() => {
      if (props.section === currentSection()) {
        ref.dataset.active = "";
      } else {
        delete ref.dataset.active;
      }
    });
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      setCurrentSection(() => untrack(() => props.section) ?? null);
      ref.scrollBy();
    };
    return (
      <div
        id={props.section}
        ref={ref!}
        onClick={handleClick}
        data-section={props.section}
        class="cursor-pointer border-l-5 border-white rounded px-[19px] py-4 data-[active]:border-[#FC7D46] data-[active]:bg-[#FFF2EC] [&:not([data-active])]:hover:border-slate-2"
      >
        {props.children}
      </div>
    );
  };
  const Condition = (
    props: ParentProps<{
      when?: (params: Params) => boolean;
      language?:
        | `frontend/${FrontendLanguage}`
        | `backend/${BackendLanguage}`
        | `hybrid/${HybridLanguage}`;
    }>,
  ) => {
    const { params, selectedLanguage } = useInteractiveDocs();
    const show = createMemo(() => {
      const whenResolver = (when: Required<typeof props>["when"]) =>
        when(params as Params);
      const languageResolver = (language: Required<typeof props>["language"]) =>
        match(selectedLanguage())
          .with(
            [P.string, P.string],
            ([frontend, backend]) =>
              `frontend/${frontend}` === language ||
              `backend/${backend}` === language,
          )
          .with(P.string, (hybrid) => `hybrid/${hybrid}` === language)
          .exhaustive();
      return (
        (props.when ? whenResolver(props.when) : true) &&
        (props.language ? languageResolver(props.language) : true)
      );
    });
    return <Show when={show()}>{props.children}</Show>;
  };
  const Toggle = (
    props: ParentProps<{
      param: {
        [K in keyof Params]: Params[K] extends boolean ? K : never;
      }[keyof Params];
      label: string;
    }>,
  ) => {
    const { setParams, params } = useInteractiveDocs();
    return (
      <div>
        <Switch
          class="inline-flex items-center"
          checked={Boolean((params as Params)[props.param])}
          onClick={(e: MouseEvent) => e.stopPropagation()}
          onChange={() =>
            (setParams as SetStoreFunction<Params>)((prev) => ({
              ...prev,
              [props.param]: !prev[props.param],
            }))
          }
        >
          <Switch.Input />
          <Switch.Control class="h-6 w-11 inline-flex items-center border border-[hsl(240_5%_84%)] rounded-xl bg-[hsl(240_6%_90%)] px-.5 transition-[background-color] transition-duration-250 data-[checked]:border-portone data-[checked]:bg-portone">
            <Switch.Thumb class="h-5 w-5 rounded-2.5 bg-white transition-transform transition-duration-250 data-[checked]:transform-translate-x-[calc(100%-1px)]" />
          </Switch.Control>
          <Switch.Label class="ml-2 select-none text-[17px] font-medium leading-[30.6px] tracking-[-0.001em]">
            {props.label}
          </Switch.Label>
        </Switch>
        {props.children}
      </div>
    );
  };
  return {
    InteractiveDoc,
    Section,
    Condition,
    Toggle,
    preload: {
      pgOptions,
      languages: {
        frontend: Object.keys(codeExamples.frontend) as [
          FrontendLanguage,
          ...FrontendLanguage[],
        ],
        backend: Object.keys(codeExamples.backend) as [
          BackendLanguage,
          ...BackendLanguage[],
        ],
        hybrid: codeExamples.hybrid ? Object.keys(codeExamples.hybrid) : [],
      },
      params: initialParams,
    },
  };
}
