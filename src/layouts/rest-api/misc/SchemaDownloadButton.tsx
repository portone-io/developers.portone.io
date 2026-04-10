import type { JSXElement } from "solid-js";

export interface SchemaDownloadButtonProps {
  href: string;
  label: JSXElement;
  children: JSXElement;
  download: string;
}
export default function SchemaDownloadButton(props: SchemaDownloadButtonProps) {
  return (
    <div class="flex flex-col items-start gap-1 text-[14px]">
      <a
        download={props.download}
        target="_blank"
        href={props.href}
        class="bg-slate-1 hover:bg-slate-2 inline-flex items-center gap-2 rounded p-2 pr-3 font-bold"
      >
        <i class="icon-[ic--baseline-download] text-xl" />
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
    <span class="text-slate-5 text-sm">
      <a href={props.href} target="_blank" class="hover:underline">
        Postman 등에서 import하여 활용
      </a>
      할 수 있습니다.
    </span>
  );
}
