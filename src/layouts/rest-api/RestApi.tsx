import * as prose from "~/components/prose";

export interface RestApiProps {
  title: string;
  children: any;
}
export default function RestApi({ title, children }: RestApiProps) {
  return (
    <div class="flex">
      <div class="flex flex-1 justify-center">
        <article class="basis-300 shrink-1 m-4 flex flex-col text-slate-700">
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
export function Tag({ title, summary, endpoints }: TagProps) {
  return (
    <TwoColumnLayout
      left={
        <>
          <prose.h2>{title}</prose.h2>
          <div class="mt-4">{summary}</div>
        </>
      }
      right={
        <ul class="bg-slate-1 rounded-lg px-2 py-4">
          {endpoints.map(({ method, path }, i) => (
            <li key={i} class="flex gap-2 font-mono text-sm">
              <span class="w-16 text-right font-bold">{method}</span>
              <span>{path}</span>
            </li>
          ))}
        </ul>
      }
    />
  );
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
