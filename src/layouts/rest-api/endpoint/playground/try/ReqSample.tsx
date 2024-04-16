import {
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
}

const availableTargets = _availableTargets();
type AvailableTarget = (typeof availableTargets)[number];
type ClientInfo = AvailableTarget["clients"][number];

export default function ReqSample({ harRequestSignal }: ReqSampleProps) {
  const targetKeySignal = useSignal("shell");
  const clientKeySignal = useSignal("curl");
  const targetInfoSignal = useTargetInfo(targetKeySignal);
  const clientInfoSignal = useClientInfo(targetInfoSignal, clientKeySignal);
  const snippetSignal = useHTTPSnippet(
    harRequestSignal,
    targetInfoSignal,
    clientInfoSignal,
  );

  return (
    <Card
      title={
        <>
          <div className="flex flex-wrap">
            <span className="flex-shrink-0">Request Sample{": "}</span>
            <div className="flex-shrink-0">
              <select
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
        </>
      }
    >
      {snippetSignal.value ? (
        <MonacoEditor
          key={snippetSignal.value}
          init={(monaco, domElement) =>
            monaco.editor.create(domElement, {
              ...commonEditorConfig,
              value: snippetSignal.value || "",
              language: targetInfoSignal.value?.key || "plaintext",
              readOnly: true,
            })
          }
        />
      ) : (
        <span class="p-4 text-xs text-slate-4 font-bold">N/A</span>
      )}
    </Card>
  );
}

function useTargetInfo(
  keySignal: Signal<string>,
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
      ) ||
      targetInfoSignal.value?.clients.find(
        (client) => client.key === targetInfoSignal.value?.default,
      ) ||
      targetInfoSignal.value?.clients[0] ||
      null;
    if (clientInfo) {
      clientKeySignal.value = clientInfo.key;
    }
    return clientInfo;
  });
}

function useHTTPSnippet(
  harRequestSignal: Signal<HarRequest | undefined>,
  targetIdSignal: ReadonlySignal<AvailableTarget | null>,
  clientIdSignal: ReadonlySignal<ClientInfo | null>,
): Signal<string | null> {
  const snippetSignal = useSignal<string | null>(null);
  useSignalEffect(() => {
    if (
      harRequestSignal.value &&
      targetIdSignal.value &&
      clientIdSignal.value
    ) {
      new HTTPSnippet(harRequestSignal.value)
        .convert(targetIdSignal.value.key, clientIdSignal.value.key)
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
