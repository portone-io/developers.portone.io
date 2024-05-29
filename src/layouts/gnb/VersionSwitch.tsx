import type { CollectionEntry } from "astro:content";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

import { updateSystemVersion, useSystemVersion } from "#state/system-version";
import { useServerFallback } from "~/misc/useServerFallback";
import type { SystemVersion } from "~/type";

const pathMappings = {
  "/api/rest-v1": "/api/rest-v2",
  "/api/rest-v2": "/api/rest-v1",
};

const hiddenPaths = ["/release-notes", "/blog", "/platform"];

export interface VersionSwitchProps {
  url: string;
  className?: string;
  serverSystemVersion: SystemVersion;
  docData: CollectionEntry<"docs">["data"] | null;
}
export function VersionSwitch({
  url,
  className,
  serverSystemVersion,
  docData,
}: VersionSwitchProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showPopover, setShowPopover] = useState(true);

  if (hiddenPaths.some((path) => new URL(url).pathname.startsWith(path)))
    return null;

  const systemVersion = useServerFallback(
    useSystemVersion(),
    serverSystemVersion,
  );

  useEffect(() => {
    const animation = popoverRef.current?.animate(
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

  useEffect(() => {
    const animation = showPopover
      ? popoverRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 400,
          fill: "forwards",
        })
      : popoverRef.current?.animate(
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
    <div className="relative">
      <div
        style={{ transition: "margin 0.1s" }}
        onClick={() => {
          const newVersion = systemVersion !== "v1" ? "v1" : "v2";
          updateSystemVersion(newVersion);
          setShowPopover(false);

          const mappedPath =
            Object.entries(pathMappings).find(([from]) =>
              location.pathname.startsWith(from),
            )?.[1] ??
            (docData?.versionVariants?.[newVersion] &&
              `/docs/${docData.versionVariants[newVersion]}`);
          if (mappedPath) location.href = mappedPath;
          else if (location.pathname.startsWith("/docs/")) return;
          else location.href = "/";
        }}
        class={clsx(
          "bg-slate-1 border-slate-3 text-12px text-slate-5 p-1px border-1 flex cursor-pointer select-none overflow-hidden whitespace-pre rounded-[6px] text-center font-bold",
          className,
        )}
      >
        <div class={getVersionClass("v1", systemVersion)}>V1</div>
        <div class={getVersionClass("v2", systemVersion)}>V2</div>
      </div>
      {(docData?.versionVariants ||
        (docData?.targetVersions?.length ?? 0) > 1) && (
        <div
          ref={popoverRef}
          className="absolute inset-x-0 top-[calc(100%+16px)] opacity-0"
        >
          <div className="absolute left-1/2 top-0 whitespace-nowrap rounded bg-portone px-2 py-1 text-white font-semibold shadow-md -translate-x-1/2">
            이 페이지의 다른 버전 보기
            <div className="absolute left-1/2 rotate-45 border-10px border-transparent border-l-portone border-t-portone -top-8px -translate-x-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}
export default VersionSwitch;

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
