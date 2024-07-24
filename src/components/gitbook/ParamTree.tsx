import type { JSXElement } from "solid-js";

import styles from "./ParamTree.module.css";

interface Props {
  children: JSXElement;
}

export default function ParamTree(props: Props) {
  return <div class={styles.paramTree}>{props.children}</div>;
}
