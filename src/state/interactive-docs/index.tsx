import { createContextProvider } from "@solid-primitives/context";
import { createEffect, createSignal } from "solid-js";

import { PgOptions } from "~/components/interactive-docs/PgSelect";

const [InteractiveDocsProvider, useInteractiveDocs] = createContextProvider(
  () => {
    const [pgOptions, setPgOptions] = createSignal<[PgOptions, ...PgOptions[]]>(
      Object.keys(PgOptions) as [PgOptions, ...PgOptions[]],
    );
    const [selectedPg, setSelectedPg] = createSignal<PgOptions>(pgOptions()[0]);
    createEffect(() => {
      setSelectedPg(pgOptions()[0]);
    });
    const [languages, setLanguages] = createSignal<{
      frontend: [string, ...string[]];
      backend: [string, ...string[]];
      hybrid: string[];
    }>({
      frontend: ["react", "html"],
      backend: ["node", "python"],
      hybrid: ["nextjs"],
    });
    const [selectedLanguage, setSelectedLanguage] = createSignal<
      [frontend: string, backend: string] | string
    >(["react", "node"]);

    return {
      pgOptions,
      setPgOptions,
      selectedPg,
      setSelectedPg,
      languages,
      setLanguages,
      selectedLanguage,
      setSelectedLanguage,
    };
  },
  {
    pgOptions: () => Object.keys(PgOptions) as [PgOptions, ...PgOptions[]],
    setPgOptions: (_) => {},
    selectedPg: () => "inicis",
    setSelectedPg: (_) => {},
    languages: () => ({
      frontend: ["react", "html"],
      backend: ["node", "python"],
      hybrid: ["nextjs"],
    }),
    setLanguages: (_) => {},
    selectedLanguage: () => ["react", "node"],
    setSelectedLanguage: (_) => {},
  },
);

export { InteractiveDocsProvider, useInteractiveDocs };
