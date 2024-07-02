import opengraphBlogBg from "~/../public/opengraph-blog-bg.png?base64";
import portoneLogoText from "~/../public/portone-logo-text.png?base64";

export interface BlogPostProps {
  title: string;
  description?: string;
  name: string;
  role?: string | undefined;
  profileImage: string;
}
export default function BlogPost({
  title,
  description,
  name,
  role,
  profileImage,
}: BlogPostProps) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        gap: "58px",
        alignItems: "flex-start",
        textAlign: "left",
        wordBreak: "keep-all",
        padding: "75px 80px",
        backgroundColor: "transparent",
        backgroundImage: `url(data:image/png;base64,${opengraphBlogBg})`,
        fontFamily: "Pretendard",
        color: "white",
      }}
    >
      <div
        style={{
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "24px",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            fontSize: "64px",
            lineHeight: "76.8px",
            wordBreak: "keep-all",
            // https://github.com/vercel/satori/issues/595
            // ["textWrap" as any]: "balance",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontWeight: 500,
            fontSize: "32px",
            lineHeight: "44.8px",
            color: "#D5D5D5",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ["textWrap" as any]: "balance",
          }}
        >
          {description}
        </div>
      </div>
      <div style={{ flexGrow: 1 }} />
      <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <img
          src={profileImage}
          style={{ width: "66px", height: "66px", borderRadius: "100%" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: "32px",
              lineHeight: "32px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontWeight: 400,
              fontSize: "26px",
              lineHeight: "26px",
              color: "#F6F6F6",
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}
