import { createContextProvider } from "@solid-primitives/context";
import { trackStore } from "@solid-primitives/deep";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";
import {
  batch,
  type Component,
  createEffect,
  createMemo,
  createSignal,
  on,
  type Setter,
} from "solid-js";
import { createStore } from "solid-js/store";
import { match, P } from "ts-pattern";
import { z } from "zod";

import type {
  Code,
  DefaultParams,
  Section,
} from "~/components/interactive-docs/code";
import type { PaymentGateway } from "~/type";

import { usePaymentGateway } from "../payment-gateway";

export type CodeExample<
  Params extends DefaultParams,
  Sections extends string,
> = {
  fileName: string;
  code: Code<Params, Sections>;
  language: string;
};

export type Tab = {
  fileName: string;
  sections: Record<string, Section>;
  code: string;
  language: string;
};

export const PayMethod = z.enum([
  "card",
  "virtualAccount",
  "transfer",
  "mobile",
  "giftCertificate",
  "easyPay",
]);
export type PayMethod = z.infer<typeof PayMethod>;

export type ConvertToPgParam<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends Partial<Record<O, any>>,
  O extends PaymentGateway = PaymentGateway,
  ValueName extends string = "payMethod",
> = {
  [K in keyof T]: {
    [M in ValueName]: T[K][`${ValueName}s`][number];
  };
}[keyof T];

export type PgOptions = {
  [K in PaymentGateway]?: {
    payMethods: PayMethod[];
  };
};

const highlighterInstance = createHighlighterCore({
  themes: [import("shiki/themes/one-dark-pro.mjs")],
  langs: [
    import("shiki/langs/javascript.mjs"),
    import("shiki/langs/html.mjs"),
    import("shiki/langs/css.mjs"),
    import("shiki/langs/python.mjs"),
    import("shiki/langs/kotlin.mjs"),
  ],
  engine: createOnigurumaEngine(import("shiki/wasm")),
});

type Params = DefaultParams & object;
export type InteractiveDocsInit = {
  pgOptions: PgOptions;
  languages: {
    frontend: [string, ...string[]];
    backend: [string, ...string[]];
    hybrid: string[];
  };
  fallbackPg: keyof PgOptions;
  params: DefaultParams & object;
};

const [InteractiveDocsProvider, useInteractiveDocs] = createContextProvider(
  (props: { initial?: InteractiveDocsInit }) => {
    const defaultInitial: InteractiveDocsInit = {
      pgOptions: {
        toss: {
          payMethods: ["card"],
        },
      },
      languages: {
        frontend: ["react"],
        backend: ["node"],
        hybrid: ["nextjs"],
      },
      fallbackPg: "toss",
      params: {
        payMethod: "card",
      },
    };
    const initial = createMemo(() => props.initial ?? defaultInitial);
    const [params, setParams] = createStore<Params>(initial().params);
    // initial 변경 시 DefaultParams 값 초기화
    createEffect(
      on(initial, (initial) => {
        setParams(initial.params);
      }),
    );

    const [preview, setPreview] = createSignal<Component | undefined>(
      undefined,
    );
    const { paymentGateway: _paymentGateway, setPaymentGateway } =
      usePaymentGateway();
    const paymentGateway = createMemo(() => {
      return match(_paymentGateway())
        .with(
          P.not("all"),
          (pgName) => initial().pgOptions[pgName],
          (pgName) => pgName,
        )
        .with("all", P.string, () => {
          setPaymentGateway(initial().fallbackPg);
          return initial().fallbackPg;
        })
        .exhaustive();
    });

    const pgOptions = createMemo(() => initial().pgOptions);
    // PG사 변경 시 처리
    createEffect(
      on([paymentGateway, pgOptions], ([paymentGateway, pgOptions]) => {
        const pgOption = pgOptions[paymentGateway];
        if (pgOption === undefined) {
          const firstPgName = Object.keys(pgOptions)[0];
          if (firstPgName !== undefined) {
            setPaymentGateway(firstPgName as PaymentGateway);
          }
        } else {
          const payMethod = pgOption.payMethods.find(
            (method) => method === params.payMethod,
          );
          if (!payMethod && pgOption.payMethods[0]) {
            setParams("payMethod", pgOption.payMethods[0]);
          }
        }
      }),
    );

    const languages = createMemo(() => initial().languages);
    const [selectedLanguage, setSelectedLanguage] = createSignal<
      [frontend: string, backend: string] | string | null
    >([languages().frontend[0], languages().backend[0]]);
    // 언어 변경 시 처리
    createEffect(
      on([selectedLanguage, languages], ([selectedLanguage, languages]) => {
        if (selectedLanguage === null) return;
        if (Array.isArray(selectedLanguage)) {
          const [frontend, backend] = selectedLanguage;
          batch(() => {
            if (!languages.frontend.includes(frontend)) {
              setSelectedLanguage([languages.frontend[0], backend]);
            }
            if (!languages.backend.includes(backend)) {
              setSelectedLanguage([frontend, languages.backend[0]]);
            }
          });
        } else {
          if (!languages.hybrid.includes(selectedLanguage)) {
            setSelectedLanguage(
              languages.hybrid[0] ?? [
                languages.frontend[0],
                languages.backend[0],
              ],
            );
          }
        }
      }),
    );

    const [codeExamples, setCodeExamples] = createSignal<{
      frontend: Record<string, CodeExample<Params, string>[]>;
      backend: Record<string, CodeExample<Params, string>[]>;
      hybrid?: Record<string, CodeExample<Params, string>[]>;
    }>({
      frontend: {},
      backend: {},
    });
    const [tabs, setTabs] = createSignal<Tab[]>([]);
    createEffect(
      on(
        [() => trackStore(params), selectedLanguage, codeExamples],
        ([params, selectedLanguage, codeExamples]) => {
          const resolveCode = (example: CodeExample<Params, string>): Tab => {
            const { code, sections } = example.code(params, paymentGateway);
            return {
              fileName: example.fileName,
              code,
              sections: sections as Record<string, Section>,
              language: example.language,
            };
          };
          if (selectedLanguage === null) return [];
          if (Array.isArray(selectedLanguage)) {
            const [frontend, backend] = selectedLanguage;
            return setTabs(
              [
                ...(codeExamples["frontend"][frontend] ?? []),
                ...(codeExamples["backend"][backend] ?? []),
              ].map(resolveCode),
            );
          }
          const hybrid = codeExamples["hybrid"];
          return setTabs(
            hybrid ? (hybrid[selectedLanguage] ?? []).map(resolveCode) : [],
          );
        },
      ),
    );
    const [selectedTab, setSelectedTab] = createSignal<string | null>(
      tabs()[0]?.fileName ?? null,
    );
    createEffect(
      on([tabs, selectedTab], ([tabs, selectedTab]) => {
        const tab = tabs.find((tab) => tab.fileName === selectedTab);
        if (!tab) {
          setSelectedTab(tabs[0]?.fileName ?? null);
        }
      }),
    );
    const sections = createMemo<Record<string, { fileName: string } & Section>>(
      () => {
        const result = tabs().reduce(
          (acc, tab) => {
            for (const [
              section,
              { startLine, endLine },
            ] of Object.entries<Section>(tab.sections)) {
              if (section in acc) {
                console.error(
                  `Section "${section}" is defined in multiple files`,
                );
              }
              acc[section] = {
                fileName: tab.fileName,
                startLine,
                endLine,
              };
            }
            return acc;
          },
          {} as Record<string, { fileName: string } & Section>,
        );
        return result;
      },
    );
    const [currentSection, setCurrentSection] = createSignal<string | null>(
      null,
    );
    const highlightSection = createMemo<
      ({ fileName: string } & Section) | null
    >(() => {
      const section = currentSection();
      if (!section) return null;
      return sections()[section] ?? null;
    });
    // Section 변경 시 Tab 이동
    createEffect(
      on([highlightSection, tabs], ([section, tabs]) => {
        if (!section) return;
        const tab = tabs.find((tab) => tab.fileName === section.fileName);
        if (tab) {
          setSelectedTab(tab?.fileName);
        }
      }),
    );

    const [highlighter, setHighlighter] =
      createSignal<Awaited<ReturnType<typeof createHighlighterCore>>>();
    void highlighterInstance.then(setHighlighter);

    return {
      paymentGateway,
      pgOptions,
      languages,
      selectedLanguage,
      setSelectedLanguage,
      params,
      setParams,
      setCodeExamples,
      sections,
      currentSection,
      setCurrentSection,
      tabs,
      selectedTab,
      setSelectedTab,
      highlighter,
      highlightSection,
      preview,
      setPreview,
    };
  },
  {
    paymentGateway: () => "toss",
    pgOptions: () => ({
      toss: {
        payMethods: ["card"],
      },
    }),
    languages: () => ({
      frontend: ["React", "HTML"],
      backend: ["Express", "FastAPI", "Flask", "Spring_Kotlin"],
      hybrid: [],
    }),
    selectedLanguage: () => ["react", "express"],
    setSelectedLanguage: (_) => {},
    params: {
      payMethod: "card",
    },
    setParams: () => {},
    setCodeExamples: (_) => {},
    tabs: () => [],
    sections: () => ({}),
    currentSection: () => null,
    setCurrentSection: (_) => {},
    selectedTab: () => null,
    setSelectedTab: (_) => {},
    highlighter: () => undefined,
    highlightSection: () => null,
    preview: () => undefined,
    setPreview: ((_) => {}) as Setter<Component | undefined>,
  },
);

export { InteractiveDocsProvider, useInteractiveDocs };
