/** @jsxImportSource ../jsx */
import Template from "./Template";

export interface TitleAndDescriptionProps {
  title: string;
  description: string;
}
export default function TitleAndDescription({
  title,
  description,
}: TitleAndDescriptionProps) {
  return (
    <Template>
      {title}
      {description}
    </Template>
  );
}
