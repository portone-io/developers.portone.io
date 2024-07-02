import opengraphMainBg from "~/../public/opengraph-main-bg.png?base64";
import portoneLogoText from "~/../public/portone-logo-text.png?base64";

export default function Main({ siteName }: { siteName?: string | undefined }) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        gap: "24px",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        backgroundColor: "transparent",
        backgroundImage: `url(data:image/png;base64,${opengraphMainBg})`,
      }}
    >
      <img
        src={`data:image/png;base64,${portoneLogoText}`}
        style={{ width: "347px" }}
      />
      <div
        style={{
          fontSize: "58px",
          fontWeight: 500,
        }}
      >
        {siteName ?? "개발자센터"}
      </div>
    </div>
  );
}
