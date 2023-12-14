import { forwardRef } from "preact/compat";

export function h1({ children, ...props }: any) {
  return (
    <h1
      {...props}
      class={`text-22px md:text-30px mt-12px mb-12px font-bold leading-[1.6] first:mt-0 last:mb-0 ${
        props.class || ""
      }`.trim()}
    >
      {children}
    </h1>
  );
}

export const h2 = forwardRef<HTMLHeadingElement, any>(function h2(
  { children, ...props },
  ref
) {
  return (
    <h2
      ref={ref}
      {...props}
      class={`text-18px md:text-24px mt-12px mb-12px font-bold leading-[1.6] first:mt-0 last:mb-0 ${
        props.class || ""
      }`.trim()}
    >
      {children}
    </h2>
  );
});

export function h3({ children, ...props }: any) {
  return (
    <h3
      {...props}
      class={`text-16px md:text-22px mt-12px mb-12px font-bold leading-[1.6] first:mt-0 last:mb-0 ${
        props.class || ""
      }`.trim()}
    >
      {children}
    </h3>
  );
}

export function h4({ children, ...props }: any) {
  return (
    <h4
      {...props}
      class={`mt-8px mb-8px md:text-18px font-bold leading-[1.6] first:mt-0 last:mb-0 ${
        props.class || ""
      }`.trim()}
    >
      {children}
    </h4>
  );
}

export function p({ children, ...props }: any) {
  return (
    <p
      {...props}
      class={`mt-8px mb-8px leading-[1.6] first:mt-0 last:mb-0 ${
        props.class || ""
      }`}
    >
      {children}
    </p>
  );
}

export function a({ children, ...props }: any) {
  return (
    <a
      {...props}
      class="text-orange-5 hover:text-orange-7 cursor-pointer hover:underline"
    >
      {children}
    </a>
  );
}

export function blockquote({ children, ...props }: any) {
  return (
    <blockquote {...props} class="my-2 border-l-4 pl-4">
      {children}
    </blockquote>
  );
}
