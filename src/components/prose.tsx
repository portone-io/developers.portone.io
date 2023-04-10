export function h1({ children, ...props }: any) {
  return (
    <h1 {...props} class="font-bold text-3xl md:text-4xl">
      {children}
    </h1>
  );
}

export function h3({ children, ...props }: any) {
  return (
    <h1 {...props} class="mt-5 mb-2 font-bold md:text-xl">
      {children}
    </h1>
  );
}

export function p({ children, ...props }: any) {
  return (
    <p {...props} class="my-2">
      {children}
    </p>
  );
}

export function a({ children, ...props }: any) {
  return (
    <a
      {...props}
      class="text-orange-5 hover:text-orange-7 hover:underline cursor-pointer"
    >
      {children}
    </a>
  );
}
