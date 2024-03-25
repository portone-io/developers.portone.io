/** @jsxImportSource ../jsx */

import opengraphDocsBg from "~/../public/opengraph-docs-bg.png?base64";
import portoneLogoText from "~/../public/portone-logo-text.png?base64";

export interface TitleAndDescriptionProps {
  title?: string;
  description?: string;
}
export default function TitleAndDescription({
  title,
  // description,
}: TitleAndDescriptionProps) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        justifyContent: "center",
        alignItems: "center",
        padding: "75px 80px",
        backgroundColor: "transparent",
        backgroundImage: `url(data:image/png;base64,${opengraphDocsBg})`,
        fontFamily: "Pretendard",
        color: "white",
      }}
    >
      {title && (
        <div
          style={{
            textAlign: "center",
            fontSize: "64px",
            fontWeight: "bold",
            lineHeight: "120%",
            wordBreak: "keep-all",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["textWrap" as any]: "balance",
          }}
        >
          {title}
        </div>
      )}
      {/* {description && (
        <div
          style={{
            fontSize: "40px",
            fontWeight: "400",
            lineHeight: "120%",
            color: "#D5D5D5",
            wordBreak: "keep-all",
            ["textWrap" as any]: "balance",
          }}
        >
          {description}
        </div>
      )} */}
      <div
        style={{
          position: "absolute",
          top: "75px",
          left: "80px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontWeight: 500,
          fontSize: "30px",
          lineHeight: "30px",
        }}
      >
        <img
          src={`data:image/png;base64,${portoneLogoText}`}
          style={{ width: "180px" }}
        />
        개발자센터
      </div>
    </div>
  );
}
