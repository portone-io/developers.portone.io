export interface SchemaDownloadButtonProps {
  href: string;
  label: any;
  children: any;
}
export default function SchemaDownloadButton({
  href,
  label,
  children,
}: SchemaDownloadButtonProps) {
  return (
    <div class="text-14px flex flex-col items-start gap-1">
      <a
        download="portone-v1-swagger.json"
        target="_blank"
        href={href}
        class="hover:bg-slate-2 bg-slate-1 inline-flex items-center gap-2 rounded p-2 pr-3 font-bold"
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
    <span class="text-slate-5 text-sm">
      <a href={href} target="_blank" class="hover:underline">
        Postman 등에서 import하여 활용
      </a>
      할 수 있습니다.
    </span>
  );
}
