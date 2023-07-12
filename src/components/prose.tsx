export function h1({ children, ...props }: any) {
  return (
    <h1 {...props} class="mt-5 text-3xl font-bold first:mt-0 md:text-4xl">
      {children}
    </h1>
  );
}

export function h2({ children, ...props }: any) {
  return (
    <h2 {...props} class="mb-2 mt-5 text-xl font-bold first:mt-0 md:text-2xl">
      {children}
    </h2>
  );
}

export function h3({ children, ...props }: any) {
  return (
    <h3 {...props} class="mb-2 mt-5 font-bold first:mt-0 md:text-xl">
      {children}
    </h3>
  );
}

export function h4({ children, ...props }: any) {
  return (
    <h4 {...props} class="mb-2 mt-5 font-bold first:mt-0">
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

export function ul({ children, ...props }: any) {
  return (
    <ol
      {...props}
      class="my-2 flex list-disc flex-col gap-2 pl-6 first:mt-0 last:mb-0"
    >
      {children}
    </ol>
  );
}

export function ol({ children, ...props }: any) {
  return (
    <ol
      {...props}
      class="my-2 flex list-decimal flex-col gap-2 pl-6 first:mt-0 last:mb-0"
    >
      {children}
    </ol>
  );
}
