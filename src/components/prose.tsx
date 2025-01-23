import { A } from "@solidjs/router";
import { clsx } from "clsx";
import { createContext, type JSX, splitProps, useContext } from "solid-js";

export const ProseContext = createContext<{
  styles: Partial<
    Record<
      "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "a" | "blockquote" | "ul",
      JSX.CSSProperties
    >
  >;
}>({
  styles: {},
});

function h1(props: JSX.IntrinsicElements["h1"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h1
      {...rest}
      class={clsx(
        "text-6 mt-12px mb-12px font-500 leading-[28.8px] tracking-[-.021em] first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.h1}
    >
      {local.children}
    </h1>
  );
}

function h2(props: JSX.IntrinsicElements["h2"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h2
      {...rest}
      class={clsx(
        "text-5 mt-12px mb-12px font-500 leading-[24px] tracking-[-.02em] first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.h2}
    >
      {local.children}
    </h2>
  );
}

function h3(props: JSX.IntrinsicElements["h3"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h3
      {...rest}
      class={clsx(
        "text-[18px] mt-12px mb-12px font-500 leading-[22px] tracking-[-.018em] first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.h3}
    >
      {local.children}
    </h3>
  );
}

function h4(props: JSX.IntrinsicElements["h4"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h4
      {...rest}
      class={clsx(
        "text-[15px] mt-8px mb-8px font-500 leading-5 tracking-[-.014em] first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.h4}
    >
      {local.children}
    </h4>
  );
}

function h5(props: JSX.IntrinsicElements["h5"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h5
      {...rest}
      class={clsx(
        "text-.875rem mt-8px mb-8px font-medium leading-[1.4] tracking-[-.006em] first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.h5}
    >
      {local.children}
    </h5>
  );
}

function h6(props: JSX.IntrinsicElements["h6"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <h6
      {...rest}
      class={clsx(
        "text-.875rem mt-8px mb-8px font-medium leading-[1.4] tracking-[-.006em] first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.h6}
    >
      {local.children}
    </h6>
  );
}

function p(props: JSX.IntrinsicElements["p"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <p
      {...rest}
      class={clsx(
        "mt-8px mb-8px leading-5 font-400 first:mt-0 last:mb-0",
        local.class,
      )}
      style={styles.p}
    >
      {local.children}
    </p>
  );
}

function a(props: JSX.IntrinsicElements["a"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class", "href"]);
  return (
    <A
      {...rest}
      href={local.href ?? "#"}
      class={clsx(
        "text-orange-5 hover:text-orange-7 cursor-pointer hover:underline",
        local.class,
      )}
      style={styles.a}
    >
      {local.children}
    </A>
  );
}

function blockquote(props: JSX.IntrinsicElements["blockquote"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <blockquote
      {...rest}
      class={clsx("my-2 border-l-4 pl-4", local.class)}
      style={styles.blockquote}
    >
      {local.children}
    </blockquote>
  );
}

function ul(props: JSX.IntrinsicElements["ul"]) {
  const { styles } = useContext(ProseContext);
  const [local, rest] = splitProps(props, ["children"]);
  return (
    <ul {...rest} style={styles.ul}>
      {local.children}
    </ul>
  );
}

export const prose = {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p,
  a,
  blockquote,
  ul,
} as const;
