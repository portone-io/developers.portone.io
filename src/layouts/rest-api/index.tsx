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

export function Hr() {
  return <hr class="my-16" />;
}

export function interleave<T, U>(items: T[], joiner: U): (T | U)[] {
  const result: (T | U)[] = [];
  for (const item of items) result.push(item, joiner);
  result.pop();
  return result;
}
