import clsx from "clsx";
import type { JSXElement } from "solid-js";

import styles from "./ParamTree.module.css";

interface Props {
  children: JSXElement;
}

export default function ParamTree(props: Props) {
  return <div class={clsx(styles.paramTree, "text-xs")}>{props.children}</div>;
}
