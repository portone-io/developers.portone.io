/** @jsxImportSource ../jsx */

export interface TemplateProps {
  children: any;
}
export default function Template({ children }: TemplateProps) {
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
        {children}
      </div>
    </div>
  );
}
