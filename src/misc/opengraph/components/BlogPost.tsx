/** @jsxImportSource ../jsx */
import Template from "./Template";

export interface BlogPostProps {
  title: string;
  description?: string;
  name: string;
  profileImage: string;
}
export default function BlogPost({
  title,
  description,
  name,
  profileImage,
}: BlogPostProps) {
  return (
    <Template style={{ gap: "26px", paddingBottom: "30px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <div
          style={{
            paddingTop: "75px",
            display: "flex",
            flexBasis: "400px",
            flexDirection: "column",
            height: "470px",
            gap: "24px",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <img
            src={profileImage}
            style={{ width: "225px", height: "225px", borderRadius: "100%" }}
          />
          <div
            style={{
              color: "#FC6B2D",
              textAlign: "center",
              fontSize: "32px",
              fontWeight: "400",
              lineHeight: "100%",
            }}
          >
            {name.toUpperCase()}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexBasis: "800px",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "-30px",
              fontSize: "64px",
              fontWeight: "700",
            }}
          >
            “
          </div>
          <div
            style={{
              marginTop: "30px",
              marginBottom: "50px",
              textAlign: "start",
              fontSize: "64px",
              fontWeight: "700",
              lineHeight: "120%",
              wordBreak: "keep-all",
              ["textWrap" as any]: "balance",
            }}
          >
            {title}
          </div>
          {description && (
            <div
              style={{
                textAlign: "start",
                fontSize: "40px",
                fontWeight: "400",
                lineHeight: "120%",
                wordBreak: "keep-all",
                ["textWrap" as any]: "balance",
              }}
            >
              {description}
            </div>
          )}
        </div>
      </div>
    </Template>
  );
}
