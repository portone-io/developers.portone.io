export interface FigureProps {
  src: string;
  caption?: any;
  width?: string;
}
export default function Figure({ src, caption, width }: FigureProps) {
  return (
    <figure class="my-4 flex flex-col items-center gap-2">
      <img class="border" src={src} alt={caption} width={width} />
      {caption && (
        <figcaption class="text-slate-5 text-sm">{caption}</figcaption>
      )}
    </figure>
  );
}
