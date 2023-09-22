import { forwardRef } from "preact/compat";

export function h1({ children, ...props }: any) {
  return (
    <h1
      {...props}
      class={`mt-5 text-3xl font-bold first:mt-0 last:mb-0 md:text-4xl ${
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
      class={`mb-2 mt-5 text-xl font-bold first:mt-0 last:mb-0 md:text-2xl ${
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
      class={`mb-2 mt-5 font-bold first:mt-0 last:mb-0 md:text-xl ${
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
      class={`mb-2 mt-5 font-bold first:mt-0 last:mb-0 ${
        props.class || ""
      }`.trim()}
    >
      {children}
    </h4>
  );
}

export function p({ children, ...props }: any) {
  return (
    <p {...props} class="my-2 first:mt-0 last:mb-0">
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
