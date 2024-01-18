export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: any;
  titleClass?: string;
}
export default function Card({ title, titleClass, ...props }: CardProps) {
  return (
    <div
      {...props}
      class={`border-slate-2 flex flex-col rounded-lg border ${
        props.class || props.className || ""
      }`}
    >
      <div
        class={`border-slate-2 flex h-10 items-center justify-between border-b px-4 font-bold ${
          titleClass || ""
        }`}
      >
        {title}
      </div>
      {props.children}
    </div>
  );
}
