import { A } from "@solidjs/router";
import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";

export function h1(props: JSX.IntrinsicElements["h1"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h1
      {...rest}
      class={clsx(
        "text-[24px] mt-12px mb-12px font-500 leading-[28.8px] tracking-[-.021em] first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </h1>
  );
}

export function h2(props: JSX.IntrinsicElements["h2"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h2
      {...rest}
      class={clsx(
        "text-[20px] mt-12px mb-12px font-500 leading-[24px] tracking-[-.02em] first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </h2>
  );
}

export function h3(props: JSX.IntrinsicElements["h3"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h3
      {...rest}
      class={clsx(
        "text-[18px] mt-12px mb-12px font-500 leading-[22px] tracking-[-.018em] first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </h3>
  );
}

export function h4(props: JSX.IntrinsicElements["h4"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h4
      {...rest}
      class={clsx(
        "text-[15px] mt-8px mb-8px font-500 leading-[20px] tracking-[-.014em] first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </h4>
  );
}

export function h5(props: JSX.IntrinsicElements["h5"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h5
      {...rest}
      class={clsx(
        "text-.875rem mt-8px mb-8px font-medium leading-[1.4] tracking-[-.006em] first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </h5>
  );
}

export function h6(props: JSX.IntrinsicElements["h6"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h6
      {...rest}
      class={clsx(
        "text-.875rem mt-8px mb-8px font-medium leading-[1.4] tracking-[-.006em] first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </h6>
  );
}

export function p(props: JSX.IntrinsicElements["p"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <p
      {...rest}
      class={clsx(
        "mt-8px mb-8px text-[15px] leading-[20px] font-400 first:mt-0 last:mb-0",
        local.class,
      )}
    >
      {local.children}
    </p>
  );
}

export function a(props: JSX.IntrinsicElements["a"]) {
  const [local, rest] = splitProps(props, ["children", "class", "href"]);
  return (
    <A
      {...rest}
      href={local.href ?? "#"}
      class={clsx(
        "text-orange-5 hover:text-orange-7 cursor-pointer hover:underline",
        local.class,
      )}
    >
      {local.children}
    </A>
  );
}

export function blockquote(props: JSX.IntrinsicElements["blockquote"]) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <blockquote {...rest} class={clsx("my-2 border-l-4 pl-4", local.class)}>
      {local.children}
    </blockquote>
  );
}
