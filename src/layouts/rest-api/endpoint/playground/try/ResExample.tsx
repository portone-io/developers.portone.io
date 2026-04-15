import JsonViewer from "../../../editor/JsonViewer";
import Card from "../Card";

export interface ResExampleProps {
  example: { [key: string]: unknown } | undefined;
}

export default function ResExample({ example }: ResExampleProps) {
  return (
    <Card title={`Response Example`}>
      {example ? (
        <JsonViewer jsonText={JSON.stringify(example, null, 2) + "\n"} />
      ) : (
        <span class="p-4 text-xs font-bold text-slate-4">N/A</span>
      )}
    </Card>
  );
}
