type Props = React.HTMLAttributes<HTMLElement>;

export function h1({ children }: Props) {
  return <h1 class="font-bold text-3xl md:text-4xl">{children}</h1>;
}

export function h3({ children }: Props) {
  return <h1 class="mt-5 mb-2 font-bold md:text-xl">{children}</h1>;
}

export function p({ children }: Props) {
  return <p class="my-2">{children}</p>;
}

export function a({ children }: Props) {
  return (
    <a class="text-orange-5 hover:text-orange-7 hover:underline cursor-pointer">
      {children}
    </a>
  );
}
