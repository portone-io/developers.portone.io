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
}
export interface TagProps {
  schema: any;
  title: string;
  summary: any;
  description?: any;
  endpoints: Endpoint[];
}
export function Tag({ schema, title, summary, endpoints }: TagProps) {
  return (
    <div class="flex flex-col gap-6">
      <TwoColumnLayout
        left={
          <>
            <prose.h2>{title}</prose.h2>
            <div class="mt-4">{summary}</div>
          </>
        }
        right={
          <ul class="border-slate-3 bg-slate-1 rounded-lg border px-2 py-4">
            {endpoints.map(({ method, path }, i) => (
              <li key={i} class="flex gap-2 font-mono text-sm leading-relaxed">
                <span class="w-16 text-right font-bold">{method}</span>
                <span>{path}</span>
              </li>
            ))}
          </ul>
        }
      />
      <Expand renderWhenHidden>
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
  return (
    <div class="flex flex-col gap-6">
      <TwoColumnLayout
        left={
          <>
            <prose.h2>타입 정의</prose.h2>
            <div class="mt-4">
              API 요청/응답의 각 필드에서 사용되는 타입 정의들을 확인할 수
              있습니다
            </div>
          </>
        }
        right={
          <div class="border-slate-3 bg-slate-1 grid-flow-rows grid gap-x-4 gap-y-1 rounded-lg border px-6 py-4 text-xs md:grid-cols-2">
            {typenames.map((typename) => (
              <span>{typename}</span>
            ))}
          </div>
        }
      />
      <Expand renderWhenHidden></Expand>
    </div>
  );
}

export interface EndpointDocProps {
  schema: any;
  endpoint: Endpoint;
}
export function EndpointDoc(_props: EndpointDocProps) {
  return null;
}

export interface TwoColumnLayoutProps {
  left: any;
  right: any;
  stickyRight?: boolean;
}
export function TwoColumnLayout({
  left,
  right,
  stickyRight,
}: TwoColumnLayoutProps) {
  const rightClass = stickyRight ? "lg:sticky top-20 h-max" : "";
  return (
    <div class="relative grid gap-8 lg:grid-cols-2 lg:gap-4">
      <div>{left}</div>
      <div class={rightClass}>{right}</div>
    </div>
  );
}

export interface ExpandProps {
  children?: any;
  expand?: boolean;
  onExpand?: (expand: boolean) => void;
  renderWhenHidden?: boolean;
}
export function Expand({
  children,
  expand,
  onExpand,
  renderWhenHidden,
}: ExpandProps) {
  return (
    <div class="flex flex-col gap-6 place-self-center">
      {(expand || renderWhenHidden) && (
        <div class={`flex flex-col ${expand ? "" : "hidden"}`}>{children}</div>
      )}
      <button
        class="bg-slate-1 border-slate-3 inline-flex gap-2 rounded-full border py-2 pl-6 pr-4"
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
