import { signal } from "@preact/signals";
import * as React from "react";

const counter = signal(1);

const Test: React.FC = () => {
  return (
    <>
      <button onClick={() => counter.value++}>+</button>
      <button onClick={() => counter.value--}>-</button>
      {counter.value}
    </>
  );
};

export default Test;
