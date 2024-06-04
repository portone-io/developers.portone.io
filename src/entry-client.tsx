// @refresh reload
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "@unocss/reset/tailwind.css";
import "uno.css";
import "./styles/global.css";

import { mount, StartClient } from "@solidjs/start/client";

mount(() => <StartClient />, document.getElementById("app")!);
