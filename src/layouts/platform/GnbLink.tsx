import type React from "preact/compat";

export interface GnbLinkProps {
  slug: string;
  active: boolean;
  children?: React.ReactNode;
}
function GnbLink({ slug, active, children }: GnbLinkProps) {
  return (
    <a
      href={`/platform/${slug}`}
      class={`flex h-full items-center ${
        active
          ? "border-b-orange-6 border-b-2 border-t-2 border-t-transparent font-bold"
          : ""
      }`}
      onClick={() => trackEvent("Developers_Platform_Gnb_Click", { slug })}
    >
      {children}
    </a>
  );
}
export default GnbLink;
