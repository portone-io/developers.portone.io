import mixpanel from "mixpanel-browser";
import { createRenderEffect } from "solid-js";

interface Props {
  isProd: boolean;
}

export default function Mixpanel(props: Props) {
  const mixpanelId = () =>
    props.isProd
      ? "e9baf66771bda3ae43b7c75727c2c55e"
      : "a0e1ac1b614052880e6e10977fe7da4e";

  createRenderEffect(() => {
    mixpanel.init(mixpanelId(), {
      debug: true,
      track_pageview: true,
      persistence: "localStorage",
    });
  });

  return <></>;
}
