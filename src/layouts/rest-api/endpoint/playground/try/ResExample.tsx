import type { Operation } from "~/layouts/rest-api/schema-utils/operation";

import JsonViewer from "../../../editor/JsonViewer";
import Card from "../Card";

export interface ResExampleProps {
  operation: Operation;
}

export default function ResExample({ operation }: ResExampleProps) {
  const example =
    operation.responses?.["200"]?.content?.["application/json"]?.example;
  return (
    <Card title={`Response Example`}>
      {example ? (
        <JsonViewer jsonText={JSON.stringify(example, null, 2) + "\n"} />
      ) : (
        <span class="p-4 text-xs text-slate-4 font-bold">N/A</span>
      )}
    </Card>
  );
}
