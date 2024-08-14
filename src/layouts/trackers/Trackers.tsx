import { onMount } from "solid-js";

import GoogleTagManager from "./GoogleTagManager";
import NaverAdvertiseAnalytics from "./NaverAdvertiseAnalytics";

const isProd = import.meta.env.VERCEL_ENV === "production";

export default function Trackers() {
  onMount(() => {
    window.addEventListener("click", (e) => {
      const a = (e.target as Element).closest("a");
      if (!a) return;
      const isExternalLink = (() => {
        try {
          const url = new URL(a.href);
          return url.hostname !== location.hostname;
        } catch {
          return false;
        }
      })();
      const targetIsSelf = !a.target || a.target === "_self";
      const specialBehavior = e.ctrlKey || e.metaKey || e.button !== 0;
      if (!isExternalLink && targetIsSelf && !specialBehavior) {
        e.preventDefault();
      }
    });
  });

  return (
    <>
      {isProd && <GoogleTagManager />}
      {isProd && <NaverAdvertiseAnalytics />}
    </>
  );
}
