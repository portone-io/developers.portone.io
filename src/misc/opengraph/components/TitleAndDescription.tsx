/** @jsxImportSource ../jsx */
import Template from "./Template";

export interface TitleAndDescriptionProps {
  title?: string;
  description?: string;
}
export default function TitleAndDescription({
  title,
  description,
}: TitleAndDescriptionProps) {
  return (
    <Template style={{ gap: "26px" }}>
      {title && (
        <div
          style={{
            textAlign: "center",
            fontSize: "96px",
            fontWeight: description ? "800" : "700",
            lineHeight: "120%",
          }}
        >
          {title}
        </div>
      )}
      {description && (
        <div
          style={{
            fontSize: "48px",
            fontWeight: "400",
            lineHeight: "120%",
          }}
        >
          {description}
        </div>
      )}
    </Template>
  );
}
