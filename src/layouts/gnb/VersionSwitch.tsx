import { useLocation, useNavigate } from "@solidjs/router";
import clsx from "clsx";
import {
  createEffect,
  createMemo,
  createSignal,
  Show,
  startTransition,
} from "solid-js";

import type { DocsEntry } from "~/content/config";
import { useSystemVersion } from "~/state/system-version";
import type { SystemVersion } from "~/type";

const pathMappings = {
  "/api/rest-v1": "/api/rest-v2",
  "/api/rest-v2": "/api/rest-v1",
};

const hiddenPaths = ["/release-notes", "/blog", "/platform"];

export interface VersionSwitchProps {
  class?: string;
  docData?: DocsEntry;
}
export function VersionSwitch(props: VersionSwitchProps) {
  let popoverRef: HTMLDivElement | undefined;
  const [showPopover, setShowPopover] = createSignal(true);

  const location = useLocation();
  const navigate = useNavigate();
  const show = createMemo(
    () => !hiddenPaths.some((path) => location.pathname.startsWith(path)),
  );

  const { systemVersion, setSystemVersion } = useSystemVersion();

  createEffect(() => {
    const animation = popoverRef?.animate(
      [{ transform: "translateY(0px)" }, { transform: "translateY(4px)" }],
      {
        duration: 600,
        easing: "ease-in",
        direction: "alternate",
        iterations: Infinity,
      },
    );
    const timeout = setTimeout(() => {
      setShowPopover(false);
    }, 5000);

    return () => {
      animation?.cancel();
      clearTimeout(timeout);
    };
  }, []);

  createEffect(() => {
    const animation = showPopover()
      ? popoverRef?.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 400,
          fill: "forwards",
        })
      : popoverRef?.animate(
          [{ opacity: 1 }, { opacity: 0, pointerEvents: "none" }],
          {
            duration: 400,
            fill: "forwards",
          },
        );
    return () => {
      animation?.cancel();
    };
  }, [showPopover]);

  return (
    <Show when={show()}>
      <div class="relative">
        <div
          style={{ transition: "margin 0.1s" }}
          onClick={() => {
            const newVersion = systemVersion() !== "v1" ? "v1" : "v2";
            void startTransition(() => {
              setSystemVersion(newVersion);
            });
            setShowPopover(false);

            const mappedPath =
              Object.entries(pathMappings).find(([from]) =>
                location.pathname.startsWith(from),
              )?.[1] ??
              (props.docData?.versionVariants?.[newVersion] &&
                `/opi${props.docData.versionVariants[newVersion]}`);
            if (mappedPath) navigate(mappedPath);
            else if (location.pathname.startsWith("/opi/")) return;
            else navigate("/");
          }}
          class={clsx(
            "bg-slate-1 border-slate-3 text-12px text-slate-5 p-1px border-1 flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-[6px] text-center font-bold",
            props.class,
          )}
        >
          <div class={getVersionClass("v1", systemVersion())}>V1</div>
          <div class={getVersionClass("v2", systemVersion())}>V2</div>
        </div>
        {(props.docData?.versionVariants ||
          (props.docData?.targetVersions?.length ?? 0) > 1) && (
          <div
            ref={popoverRef}
            class="absolute inset-x-0 top-[calc(100%+16px)] opacity-0"
          >
            <div class="absolute left-1/2 top-0 whitespace-nowrap rounded bg-portone px-2 py-1 text-white font-semibold shadow-md -translate-x-1/2">
              이 페이지의 다른 버전 보기
              <div class="absolute left-1/2 rotate-45 border-10px border-transparent border-l-portone border-t-portone -top-8px -translate-x-1/2" />
            </div>
          </div>
        )}
      </div>
    </Show>
  );
}

function getVersionClass(
  thisVersion: SystemVersion,
  systemVersion: SystemVersion,
) {
  return `py-4px rounded-[4px] ${
    systemVersion === thisVersion
      ? "bg-orange-500 flex-1 text-white px-12px"
      : "flex-1 px-8px"
  }`;
}
