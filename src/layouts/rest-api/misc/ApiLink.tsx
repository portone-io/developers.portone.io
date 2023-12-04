import { expandAndScrollTo } from "~/state/rest-api/expand-section";
import { MethodLine } from "../endpoint/EndpointDoc";
import { getEndpointRepr } from "../schema-utils/endpoint";

export interface ApiLinkProps {
  basepath: string;
  section: string;
  method: string;
  path: string;
  apiName?: string;
}
export default function ApiLink({
  basepath,
  section,
  method,
  path,
  apiName,
}: ApiLinkProps) {
  const id = getEndpointRepr({ method, path });
  const href = `${basepath}/${section}#${encodeURIComponent(id)}`;
  const className =
    "hover:text-orange-5 hover:border-orange-2 border-b-2 pb-1 transition-colors";
  return (
    <a
      className={className}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        expandAndScrollTo({ section, href, id });
      }}
    >
      {apiName && <strong>{apiName} </strong>}
      <MethodLine method={method} path={path} />
    </a>
  );
}
