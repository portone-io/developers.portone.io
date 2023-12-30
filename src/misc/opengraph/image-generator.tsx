import sharp from "sharp";
import { readFile } from "node:fs/promises";
import satori from "satori";

export async function generate(): Promise<Buffer> {
  const svg = await satori(
    {
      key: null,
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          color: "white",
          background: "black",
          fontFamily: "Pretendard",
          fontSize: 96,
          fontWeight: 700,
          lineHeight: 96,
          letterSpacing: 0,
          textAlign: "center",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                width: "927.28px",
                height: "519.42px",
                top: "1580.88px",
                left: "355.71px",
                transformOrigin: "top left",
                transform: "rotate(-135deg)",
                background:
                  "linear-gradient(90deg, #FC6B2D 0%, rgba(252, 107, 45, 0.48) 46.88%, rgba(252, 107, 45, 0) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                width: "583.99px",
                height: "581.36px",
                top: "267.35px",
                left: "1475.23px",
                transformOrigin: "top left",
                transform: "rotate(135deg)",
                background:
                  "linear-gradient(90deg, #FC6B2D 0%, rgba(252, 107, 45, 0) 100%)",
              },
            },
          },
          "포트원 개발자 센터",
        ],
      },
    },
    {
      width: 1200,
      height: 1200,
      embedFont: true,
      fonts: [
        {
          name: "Pretendard",
          data: await readFile("./src/misc/opengraph/Pretendard-Medium.otf"),
          weight: 400,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: await readFile("./src/misc/opengraph/Pretendard-Bold.otf"),
          weight: 700,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: await readFile("./src/misc/opengraph/Pretendard-ExtraBold.otf"),
          weight: 800,
          style: "normal",
        },
      ],
    },
  );
  return await sharp(Buffer.from(svg)).toBuffer();
}
