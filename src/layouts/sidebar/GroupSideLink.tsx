import type { NavMenuGroup } from "~/state/server-only/nav";

function GroupSideLink(props: NonNullable<NavMenuGroup["side"]>) {
  return (
    <a
      href={props.link}
      target="_blank"
      class="text-orange-1 ml-1 inline-flex items-center gap-1 rounded bg-orange-600 px-2 text-sm"
      onClick={() => props.eventname && trackEvent(props.eventname, {})}
    >
      {props.label}
      <i class="i-ic-baseline-arrow-outward" />
    </a>
  );
}
export default GroupSideLink;
