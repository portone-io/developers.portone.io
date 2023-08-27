import { useSignal } from "@preact/signals";
import * as prose from "~/components/prose";

export interface RestApiProps {
  title: string;
  children: any;
}
export default function RestApi({ title, children }: RestApiProps) {
  return (
    <div class="flex">
      <div class="flex flex-1 justify-center">
        <article class="basis-300 shrink-1 mx-4 my-8 flex flex-col text-slate-700">
          <prose.h1 id="overview">{title}</prose.h1>
          {children}
        </article>
      </div>
    </div>
  );
}

export interface Endpoint {
  method: string; // GET, POST ...
  path: string;
  title: string;
}
export interface TagProps {
  schema: any;
  title: string;
  summary: any;
  description?: any;
  endpoints: Endpoint[];
}
export function Tag({ schema, title, summary, endpoints }: TagProps) {
  // const expandSignal = useSignal(false);
  const expandSignal = useSignal(true);
  return (
    <div class="flex flex-col">
      <div>
        <prose.h2>{title}</prose.h2>
      </div>
      <TwoColumnLayout
        left={<div class="mt-4">{summary}</div>}
        right={
          <ul class="border-slate-3 bg-slate-1 flex flex-col gap-4 rounded-lg border p-4">
            {endpoints.map(({ method, path, title }, i) => (
              <li key={i} class="flex flex-col text-sm leading-tight">
                <div class="text-slate-6 font-bold">{title}</div>
                <div class="text-slate-4 ml-2 flex gap-2 font-mono">
                  <span class="font-bold">{method}</span>
                  <span>{path}</span>
                </div>
              </li>
            ))}
          </ul>
        }
      />
      <Expand
        className="mt-10"
        expand={expandSignal.value}
        onExpand={(v) => (expandSignal.value = v)}
      >
        {endpoints.map((endpoint) => (
          <EndpointDoc schema={schema} endpoint={endpoint} />
        ))}
      </Expand>
    </div>
  );
}

export interface TypeDefinitionsProps {
  schema: any;
  typenames: string[];
}
export function TypeDefinitions({ typenames }: TypeDefinitionsProps) {
  const expandSignal = useSignal(false);
  return (
    <div class="flex flex-col">
      <prose.h2>타입 정의</prose.h2>
      <TwoColumnLayout
        left={
          <div class="mt-4">
            API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수
            있습니다
          </div>
        }
        right={
          <div class="border-slate-3 bg-slate-1 grid-flow-rows grid gap-x-4 gap-y-1 rounded-lg border px-6 py-4 text-xs md:grid-cols-2">
            {typenames.map((typename) => (
              <span>{typename}</span>
            ))}
          </div>
        }
      />
      <Expand
        className="mt-10"
        expand={expandSignal.value}
        onExpand={(v) => (expandSignal.value = v)}
      >
        TODO
      </Expand>
    </div>
  );
}

export interface EndpointDocProps {
  schema: any;
  endpoint: Endpoint;
}
export function EndpointDoc({ schema, endpoint }: EndpointDocProps) {
  const operation = schema.paths[endpoint.path][endpoint.method];
  console.log(operation);
  return (
    <div class="flex flex-col">
      <prose.h3>
        <div class="text-slate-5 flex items-end gap-1 rounded font-mono text-sm">
          <span class="text-base font-bold uppercase">{endpoint.method}</span>
          <span>{endpoint.path}</span>
        </div>
        <div>{endpoint.title}</div>
      </prose.h3>
      <TwoColumnLayout
        left={
          <>
            <article
              class="bg-slate-1 rounded p-2 text-sm"
              dangerouslySetInnerHTML={{
                __html: operation.description,
              }}
            />
            <TwoColumnLayout
              className="mt-2"
              left={
                <>
                  <h4 class="text-xs font-bold uppercase">Path</h4>
                  <h4 class="text-xs font-bold uppercase">Query</h4>
                  <h4 class="text-xs font-bold uppercase">Body</h4>
                </>
              }
              right={
                <>
                  <h4 class="text-xs font-bold uppercase">200</h4>
                  <h4 class="text-xs font-bold uppercase">400</h4>
                  <h4 class="text-xs font-bold uppercase">500</h4>
                </>
              }
              bp="md"
              gap={2}
            />
          </>
        }
        right={null}
      />
    </div>
  );
}

export interface TwoColumnLayoutProps {
  className?: string;
  left: any;
  right: any;
  stickyRight?: boolean;
  bp?: string;
  gap?: number;
}
export function TwoColumnLayout({
  className = "",
  left,
  right,
  stickyRight,
  bp = "lg",
  gap = 4,
}: TwoColumnLayoutProps) {
  const rightClass = stickyRight ? `${bp}:sticky top-20 h-max` : "";
  return (
    <div class={`relative grid gap-${gap} ${bp}:grid-cols-2 ${className}`}>
      <div>{left}</div>
      <div class={rightClass}>{right}</div>
    </div>
  );
}

export interface ExpandProps {
  className?: string;
  children?: any;
  expand?: boolean;
  onExpand?: (expand: boolean) => void;
}
export function Expand({
  className = "",
  children,
  expand,
  onExpand,
}: ExpandProps) {
  return (
    <div class={`flex flex-col gap-10 ${className}`}>
      {expand && (
        <div class={`flex flex-col gap-10 ${expand ? "" : "hidden"}`}>
          {children}
        </div>
      )}
      <button
        class="bg-slate-1 border-slate-3 inline-flex gap-2 place-self-center rounded-full border py-2 pl-6 pr-4"
        onClick={() => onExpand?.(!expand)}
      >
        {expand ? (
          <>
            <span>접기</span>
            <i class="i-ic-baseline-keyboard-arrow-up text-2xl" />
          </>
        ) : (
          <>
            <span>펼치기</span>
            <i class="i-ic-baseline-keyboard-arrow-down text-2xl" />
          </>
        )}
      </button>
    </div>
  );
}
