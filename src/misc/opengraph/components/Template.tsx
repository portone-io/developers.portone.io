/** @jsxImportSource ../jsx */

export interface TemplateProps {
  children: any;
  style?: any;
}
export default function Template({ children, style }: TemplateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        color: "white",
        background: "black",
        fontFamily: "Pretendard",
        fontSize: "46px",
        fontWeight: "900",
        lineHeight: "46px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "635px",
          background:
            "linear-gradient(to top, rgba(252, 107, 45, 0.35) 0%, rgba(252, 107, 45, 0.00) 100%)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "600px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "98px",
            background:
              "linear-gradient(to left, rgba(252, 107, 45, 0.80) 0%, rgba(252, 107, 45, 0.00) 100%)",
          }}
        >
          포트원 개발자 센터
        </div>
        <div
          style={Object.assign(
            {
              display: "flex",
              flexDirection: "column",
              flexGrow: "1",
              alignItems: "center",
              justifyContent: "center",
            },
            style,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
