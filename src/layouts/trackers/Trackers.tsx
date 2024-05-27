"use client";

import mixpanel from "mixpanel-browser";
import { onMount } from "solid-js";

import GoogleTagManager from "./GoogleTagManager";
import Mixpanel from "./Mixpanel";
import NaverAdvertiseAnalytics from "./NaverAdvertiseAnalytics";

const isProd = import.meta.env.VERCEL_ENV === "production";

export default function Trackers() {
  onMount(() => {
    trackEvent("Developers_Page_View", {
      title: document.title,
      pathname: location.pathname,
    });
  });

  onMount(() => {
    [
      { ms: 1000, time: "1s" },
      { ms: 10000, time: "10s" },
      { ms: 30000, time: "30s" },
      { ms: 60000, time: "1m" },
      { ms: 600000, time: "10m" },
      { ms: 1800000, time: "30m" },
    ].map(({ ms, time }) => {
      setTimeout(() => {
        trackEvent("Developers_Page_Stay", {
          title: document.title,
          pathname: location.pathname,
          time,
        });
      }, ms);
    });
  });

  onMount(() => {
    window.addEventListener("click", (e) => {
      const a = (e.target as Element).closest("a");
      if (!a) return;
      const targetIsSelf = !a.target || a.target === "_self";
      const specialBehavior = e.ctrlKey || e.metaKey || e.button !== 0;
      if (targetIsSelf && !specialBehavior) e.preventDefault();
      trackEvent(
        "Developers_Link_Click",
        {
          label: a.textContent?.trim(),
          from: location.pathname,
          to: a.href,
        },
        () => {
          if (!targetIsSelf) return;
          if ("norefresh" in a.dataset) return;
          if (specialBehavior) return;
          location.href = a.href;
        },
      );
    });
  });

  return (
    <>
      {isProd && <GoogleTagManager />}
      {isProd && <NaverAdvertiseAnalytics />}
      <Mixpanel isProd={isProd} />
    </>
  );
}

export function trackEvent(event: string, props: object, cb?: () => void) {
  const mixpanelAvailable = (() => {
    try {
      mixpanel.get_config();
      return true;
    } catch (e) {
      return false;
    }
  })();

  if (mixpanelAvailable) {
    mixpanel.track(event, props, cb);
  } else {
    // blocked by adblocker
    cb?.();
  }
}
