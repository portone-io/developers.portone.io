import { HttpStatusCode } from "@solidjs/start";
import { ErrorBoundary, type JSXElement } from "solid-js";

import portoneGradientBg from "~/assets/portone-gradient-bg.png?imagetools";
import portoneLogoWhite from "~/assets/portone-logo-white.png?imagetools";

import Picture from "./Picture";

export class NotFoundError extends Error {
  constructor() {
    super("Not Found");
    this.name = "NotFoundError";
  }
}

export function NotFoundBoundary(props: { children: JSXElement }) {
  return (
    <ErrorBoundary
      fallback={(err) => {
        if (err instanceof Error && err.name === "NotFoundError") {
          return <NotFoundPage />;
        }
        throw err;
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}

function NotFoundPage() {
  return (
    <>
      <HttpStatusCode code={404} />
      <Picture
        picture={portoneGradientBg}
        alt="PortOne"
        class="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div class="relative h-full flex flex-col items-center justify-center gap-3xl text-white">
        <div class="flex flex-col items-center gap-2.5">
          <Picture picture={portoneLogoWhite} alt="PortOne" class="w-40" />
          <span class="text-7xl font-bold tracking-[0.08em]">404</span>
          <span class="text-2xl tracking-[0.06em]">
            페이지를 찾을 수 없습니다
          </span>
        </div>
        <button
          class="flex items-center gap-1 border border-gray-300 rounded-md bg-[rgb(255_255_255_/_4%)] px-4 py-3 transition-colors active:bg-portone focus:bg-[rgb(255_255_255_/16%)] hover:bg-[rgb(255_255_255_/16%)] active:text-white focus:text-portone hover:text-portone"
          onClick={() => history.back()}
        >
          <i class="i-ic-baseline-arrow-back text-lg"></i>
          <span class="text-sm">뒤로 돌아가기</span>
        </button>
      </div>
    </>
  );
}
