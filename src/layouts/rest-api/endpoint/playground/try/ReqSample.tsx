import {
  availableTargets as _availableTargets,
  type HarRequest,
  HTTPSnippet,
} from "httpsnippet-lite";
import { Show } from "solid-js";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
} from "solid-js";

import MonacoEditor, {
  commonEditorConfig,
} from "~/layouts/rest-api/editor/MonacoEditor";

import Card from "../Card";

export interface ReqSampleProps {
  harRequest: HarRequest | undefined;
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

export default function ReqSample(props: ReqSampleProps) {
  const [targetKey, setTargetKey] = createSignal("shell");
  const [clientKey, setClientKey] = createSignal("curl");
  const targetInfo = useTargetInfo(targetKey);
  const clientInfo = useClientInfo(targetInfo, clientKey, setClientKey);
  const [snippet, setSnippet] = useHTTPSnippet(
    () => props.harRequest,
    targetInfo,
    clientInfo,
    () => props.isQueryOrBody,
  );

  return (
    <Card
      title={
        <div class="flex flex-grow flex-wrap items-center justify-between gap-3">
          <span class="flex-shrink-0">Request Sample</span>
          <div class="flex-shrink-0">
            <select
              class="rounded-l bg-slate-1 px-2 py-1 font-medium"
              value={targetKey()}
              onChange={(e) => {
                setTargetKey(String(e.currentTarget.value));
              }}
            >
              <For each={availableTargets}>
                {(target) => <option value={target.key}>{target.title}</option>}
              </For>
            </select>
            <select
              class="rounded-r bg-slate-1 px-2 py-1 font-medium"
              value={clientKey()}
              onChange={(e) => setClientKey(String(e.currentTarget.value))}
            >
              <For each={targetInfo()?.clients}>
                {(client) => <option value={client.key}>{client.title}</option>}
              </For>
            </select>
          </div>
        </div>
      }
    >
      <Show
        when={snippet()}
        fallback={<span class="text-xs text-slate-4">N/A</span>}
      >
        {(snippet) => (
          <MonacoEditor
            init={(monaco, domElement) => {
              const instance = monaco.editor.create(domElement, {
                ...commonEditorConfig,
                value: snippet() || "",
                language: targetInfo()?.language ?? "plaintext",
                readOnly: true,
              });
              createEffect(() => {
                instance.setValue(snippet() || "");
              });
              return instance;
            }}
            onChange={(value) => setSnippet(value)}
          />
        )}
      </Show>
    </Card>
  );
}

function useTargetInfo(
  key: Accessor<string>,
): Accessor<AvailableTarget | null> {
  return createMemo(
    () => availableTargets.find((target) => target.key === key()) ?? null,
  );
}

function useClientInfo(
  targetInfo: Accessor<AvailableTarget | null>,
  clientKey: Accessor<string>,
  setClientKey: (key: string) => void,
): Accessor<ClientInfo | null> {
  return createMemo(() => {
    const clientInfo =
      targetInfo()?.clients.find((client) => client.key === clientKey()) ??
      targetInfo()?.clients.find(
        (client) => client.key === targetInfo()?.default,
      ) ??
      targetInfo()?.clients[0] ??
      null;
    if (clientInfo) setClientKey(clientInfo.key);
    return clientInfo;
  });
}

function useHTTPSnippet(
  harRequest: Accessor<HarRequest | undefined>,
  target: Accessor<AvailableTarget | null>,
  client: Accessor<ClientInfo | null>,
  isQueryOrBody: Accessor<boolean>,
): [Accessor<string | null>, (snippet: string) => void] {
  const [snippet, setSnippet] = createSignal<string | null>(null);
  createEffect(() => {
    const requestValue = harRequest();
    const targetValue = target();
    const clientValue = client();
    if (requestValue && targetValue && clientValue) {
      const request =
        isQueryOrBody() && !client()?.supportGetWithBody
          ? transformHarRequestBodyToQs(requestValue)
          : requestValue;
      new HTTPSnippet(request)
        .convert(targetValue.key, clientValue.key)
        .then((snippet) => {
          if (Array.isArray(snippet)) {
            snippet = snippet.join("\n");
          }
          setSnippet(snippet);
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      setSnippet(null);
    }
  });
  return [snippet, setSnippet];
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
