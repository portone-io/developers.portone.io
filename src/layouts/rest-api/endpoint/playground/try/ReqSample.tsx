import {
  effect,
  type ReadonlySignal,
  type Signal,
  useComputed,
  useSignal,
  useSignalEffect,
} from "@preact/signals";
import {
  availableTargets as _availableTargets,
  type HarRequest,
  HTTPSnippet,
} from "httpsnippet-lite";

import MonacoEditor, {
  commonEditorConfig,
} from "~/layouts/rest-api/editor/MonacoEditor";

import Card from "../Card";

export interface ReqSampleProps {
  harRequestSignal: Signal<HarRequest | undefined>;
  isQueryOrBody: boolean;
}

const httpSnippetLanguageMap = new Map([
  ["csharp", "csharp"],
  ["go", "go"],
  ["java", "java"],
  ["javascript", "javascript"],
  ["kotlin", "kotlin"],
  ["node", "javascript"],
  ["objc", "objective-c"],
  ["php", "php"],
  ["python", "python"],
  ["ruby", "ruby"],
  ["shell", "shell"],
  ["swift", "swift"],
]);
const supportGetWithBodyTargetMap: Map<string, Set<string>> = new Map([
  ["go", new Set(["native"])],
  ["java", new Set(["asynchttp", "nethttp"])],
  ["node", new Set(["native", "request", "unirest"])],
  ["php", new Set(["curl", "guzzle", "http2"])],
  ["python", new Set(["python3", "requests"])],
  ["ruby", new Set(["native"])],
  ["shell", new Set(["curl", "httpie", "wget"])],
]);
const availableTargets = _availableTargets()
  .map((target) => ({
    ...target,
    language: httpSnippetLanguageMap.get(target.key),
    clients: target.clients.map((client) => ({
      ...client,
      supportGetWithBody:
        supportGetWithBodyTargetMap
          .get(httpSnippetLanguageMap.get(target.key)!)
          ?.has(client.key) ?? false,
    })),
  }))
  .filter((target) => target.language);
type AvailableTarget = (typeof availableTargets)[number];
type ClientInfo = AvailableTarget["clients"][number];

export default function ReqSample({
  harRequestSignal,
  isQueryOrBody,
}: ReqSampleProps) {
  const targetKeySignal = useSignal("shell");
  const clientKeySignal = useSignal("curl");
  const targetInfoSignal = useTargetInfo(targetKeySignal);
  const clientInfoSignal = useClientInfo(targetInfoSignal, clientKeySignal);
  const snippetSignal = useHTTPSnippet(
    harRequestSignal,
    targetInfoSignal,
    clientInfoSignal,
    isQueryOrBody,
  );

  return (
    <Card
      title={
        <div className="flex flex-grow flex-wrap items-center justify-between gap-3">
          <span className="flex-shrink-0">Request Sample</span>
          <div className="flex-shrink-0">
            <select
              className="rounded-l bg-slate-1 px-2 py-1 font-medium"
              value={targetKeySignal.value}
              onChange={(e) => {
                targetKeySignal.value = String(e.currentTarget.value);
              }}
            >
              {availableTargets.map((target) => (
                <option key={target.key} value={target.key}>
                  {target.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-r bg-slate-1 px-2 py-1 font-medium"
              value={clientKeySignal.value}
              onChange={(e) =>
                (clientKeySignal.value = String(e.currentTarget.value))
              }
            >
              {targetInfoSignal.value?.clients.map((client) => (
                <option key={client.key} value={client.key}>
                  {client.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      }
    >
      {snippetSignal.value ? (
        <MonacoEditor
          init={(monaco, domElement) => {
            const instance = monaco.editor.create(domElement, {
              ...commonEditorConfig,
              value: snippetSignal.value || "",
              language: targetInfoSignal.value?.language ?? "plaintext",
              readOnly: true,
            });
            const dispose = effect(() => {
              instance.setValue(snippetSignal.value || "");
            });
            instance.onDidDispose(() => dispose());
            return instance;
          }}
        />
      ) : (
        <span class="p-4 text-xs text-slate-4 font-bold">N/A</span>
      )}
    </Card>
  );
}

function useTargetInfo(
  keySignal: ReadonlySignal<string>,
): ReadonlySignal<AvailableTarget | null> {
  return useComputed(
    () =>
      availableTargets.find((target) => target.key === keySignal.value) ?? null,
  );
}

function useClientInfo(
  targetInfoSignal: ReadonlySignal<AvailableTarget | null>,
  clientKeySignal: Signal<string>,
): ReadonlySignal<ClientInfo | null> {
  return useComputed(() => {
    const clientInfo =
      targetInfoSignal.value?.clients.find(
        (client) => client.key === clientKeySignal.value,
      ) ??
      targetInfoSignal.value?.clients.find(
        (client) => client.key === targetInfoSignal.value?.default,
      ) ??
      targetInfoSignal.value?.clients[0] ??
      null;
    if (clientInfo) {
      clientKeySignal.value = clientInfo.key;
    }
    return clientInfo;
  });
}

function useHTTPSnippet(
  harRequestSignal: Signal<HarRequest | undefined>,
  targetSignal: ReadonlySignal<AvailableTarget | null>,
  clientSignal: ReadonlySignal<ClientInfo | null>,
  isQueryOrBody: boolean,
): Signal<string | null> {
  const snippetSignal = useSignal<string | null>(null);
  useSignalEffect(() => {
    if (harRequestSignal.value && targetSignal.value && clientSignal.value) {
      const harRequest =
        isQueryOrBody && !clientSignal.value.supportGetWithBody
          ? transformHarRequestBodyToQs(harRequestSignal.value)
          : harRequestSignal.value;
      new HTTPSnippet(harRequest)
        .convert(targetSignal.value.key, clientSignal.value.key)
        .then((snippet) => {
          if (Array.isArray(snippet)) {
            snippet = snippet.join("\n");
          }
          snippetSignal.value = snippet;
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      snippetSignal.value = null;
    }
  });
  return snippetSignal;
}

function transformHarRequestBodyToQs(harRequest: HarRequest): HarRequest {
  if (!harRequest.postData) return harRequest;
  if (!harRequest.postData.text) return harRequest;
  if (harRequest.postData.mimeType !== "application/json") return harRequest;
  const transformed = {
    ...harRequest,
    queryString: [
      { name: "requestBody", value: harRequest.postData.text },
      ...harRequest.queryString,
    ],
  } satisfies HarRequest;
  delete transformed.postData;
  return transformed;
}
