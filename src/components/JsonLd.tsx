import type { Thing, WithContext } from "schema-dts";

export default function JsonLd<T extends Thing>(props: {
  data: WithContext<T>;
}) {
  return (
    <script type="application/ld+json" innerHTML={JSON.stringify(props.data)} />
  );
}
