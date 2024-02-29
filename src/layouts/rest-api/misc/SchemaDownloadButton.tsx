import type React from "preact/compat";

export interface SchemaDownloadButtonProps {
  href: string;
  label: React.ReactNode;
  children: React.ReactNode;
}
export default function SchemaDownloadButton({
  href,
  label,
  children,
}: SchemaDownloadButtonProps) {
  return (
    <div class="flex flex-col items-start gap-1 text-14px">
      <a
        download="portone-v1-swagger.json"
        target="_blank"
        href={href}
        class="inline-flex items-center gap-2 rounded bg-slate-1 p-2 pr-3 font-bold hover:bg-slate-2"
      >
        <i class="i-ic-baseline-download text-xl" />
        {label}
      </a>
      {children}
    </div>
  );
}

export interface PostmanGuideProps {
  href: string;
}
export function PostmanGuide({ href }: PostmanGuideProps) {
  return (
    <span class="text-sm text-slate-5">
      <a href={href} target="_blank" class="hover:underline">
        Postman 등에서 import하여 활용
      </a>
      할 수 있습니다.
    </span>
  );
}
