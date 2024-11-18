export { code } from "./code";
import { Switch } from "@kobalte/core/switch";
import { trackStore } from "@solid-primitives/deep";
import { createIntersectionObserver } from "@solid-primitives/intersection-observer";
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
  getOwner,
  type ParentComponent,
  type ParentProps,
  runWithOwner,
  Show,
  startTransition,
  untrack,
} from "solid-js";
import type { SetStoreFunction } from "solid-js/store";
import { match, P } from "ts-pattern";

import {
  type CodeExample,
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
  initialParams: Params;
  initialSelectedExample:
    | [frontend: FrontendLanguage, backend: BackendLanguage]
    | HybridLanguage;
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
} {
  const InteractiveDoc: ParentComponent = (props) => {
    const {
      setPgOptions,
      setLanguages,
      setParams,
      setCodeExamples,
      setSelectedLanguage,
      setPreview,
      setCurrentSection,
      params,
      selectedLanguage,
    } = useInteractiveDocs();
    void startTransition(() => {
      setPgOptions(pgOptions);
      setLanguages({
        frontend: Object.keys(codeExamples.frontend) as [
          FrontendLanguage,
          ...FrontendLanguage[],
        ],
        backend: Object.keys(codeExamples.backend) as [
          BackendLanguage,
          ...BackendLanguage[],
        ],
        hybrid: codeExamples.hybrid
          ? (Object.keys(codeExamples.hybrid) as [
              HybridLanguage,
              ...HybridLanguage[],
            ])
          : [],
      });
      setParams(initialParams);
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
    const [sections, setSections] = createSignal<Element[]>([]);
    const intersectingEntriesMap = new Map<
      HTMLElement,
      IntersectionObserverEntry
    >();

    createIntersectionObserver(
      sections,
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            intersectingEntriesMap.set(entry.target as HTMLElement, entry);
          } else {
            intersectingEntriesMap.delete(entry.target as HTMLElement);
          }
        });

        if (intersectingEntriesMap.size === 0) return;

        const intersectingSections = [...intersectingEntriesMap.entries()]
          .filter(([, data]) => data.isIntersecting)
          .sort(([, a], [, b]) => {
            const aRatio = a.intersectionRatio;
            const bRatio = b.intersectionRatio;
            if (aRatio !== bRatio) return bRatio - aRatio;
            const aTop = (a.target as HTMLElement).offsetTop;
            const bTop = (b.target as HTMLElement).offsetTop;
            return aTop - bTop;
          });

        const newSection = intersectingSections[0]?.[0].dataset.section;
        if (newSection) {
          setCurrentSection(() => newSection);
        }
      },
      {
        rootMargin: "-120px 0px 0px 0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      },
    );

    createEffect(() => {
      void trackStore(params);
      void selectedLanguage;
      const owner = getOwner();
      setTimeout(() => {
        runWithOwner(owner, () => {
          setSections(() =>
            Array.from(document.querySelectorAll("[data-section]")),
          );
        });
      }, 0);
    });

    return <>{props.children}</>;
  };
  const Section = (props: ParentProps<{ section?: Sections }>) => {
    const { setCurrentSection, currentSection } = useInteractiveDocs();
    let ref: HTMLDivElement;
    createEffect(() => {
      ref.dataset.section = props.section;
    });
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
    return (
      <Show when={show()}>
        <div>{props.children}</div>{" "}
      </Show>
    );
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
        <div class="">{props.children}</div>
      </div>
    );
  };
  return {
    InteractiveDoc,
    Section,
    Condition,
    Toggle,
  };
}
