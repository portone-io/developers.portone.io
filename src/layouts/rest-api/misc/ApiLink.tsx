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
  return (
    <a
      class="border-b-2 transition-colors hover:border-orange-2 hover:text-orange-5"
      href={href}
    >
      {apiName && <strong>{apiName} </strong>}
      <MethodLine method={method} path={path} />
    </a>
  );
}
