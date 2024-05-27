import { onMount } from "solid-js";

declare global {
  interface Window {
    wcs_add?: Record<string, string>;
    _nasa?: Record<string, string>;
    wcs?: {
      inflow: () => void;
    };
    wcs_do: (nasa: Record<string, string>) => void;
  }
}

export default function NaverAdvertiseAnalytics() {
  onMount(() => {
    if (!window.wcs_add) window.wcs_add = {};
    window.wcs_add["wa"] = "s_4b3f5e61d67";
    if (!window._nasa) window._nasa = {};
    if (window.wcs) {
      window.wcs.inflow();
      window.wcs_do(window._nasa);
    }
  });

  return <script async src="https://wcs.naver.net/wcslog.js" />;
}
