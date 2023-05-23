export * from "./prose";

export function h2({ children, ...props }: any) {
  return (
    <h2 {...props} class="text-1.5rem mt-2.5rem mb-1rem font-semibold">
      {children}
    </h2>
  );
}

export function h3({ children, ...props }: any) {
  return (
    <h3 {...props} class="text-1.3rem mt-2.5rem mb-1rem font-semibold">
      {children}
    </h3>
  );
}

export function p({ children, ...props }: any) {
  return (
    <p {...props} class="text-1.1rem leading-[1.7]">
      {children}
    </p>
  );
}
