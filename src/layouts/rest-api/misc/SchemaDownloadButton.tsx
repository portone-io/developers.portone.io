import type { JSXElement } from "solid-js";

export interface SchemaDownloadButtonProps {
  href: string;
  label: JSXElement;
  children: JSXElement;
  download: string;
}
export default function SchemaDownloadButton(props: SchemaDownloadButtonProps) {
  return (
    <div class="flex flex-col items-start gap-1 text-14px">
      <a
        download={props.download}
        target="_blank"
        href={props.href}
        class="inline-flex items-center gap-2 rounded bg-slate-1 p-2 pr-3 font-bold hover:bg-slate-2"
      >
        <i class="i-ic-baseline-download text-xl" />
        {props.label}
      </a>
      {props.children}
    </div>
  );
}

export interface PostmanGuideProps {
  href: string;
}
export function PostmanGuide(props: PostmanGuideProps) {
  return (
    <span class="text-sm text-slate-5">
      <a href={props.href} target="_blank" class="hover:underline">
        Postman 등에서 import하여 활용
      </a>
      할 수 있습니다.
    </span>
  );
}
