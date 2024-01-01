/** @jsxImportSource ./jsx */

import sharp from "sharp";
import { readFile } from "node:fs/promises";
import satori from "satori";
import Main from "./components/Main";
import TitleAndDescription from "./components/TitleAndDescription";

interface GenerateConfig {
  profileImage?: string;
  title?: string;
  description?: string;
}
export async function generate({
  profileImage,
  title,
  description,
}: GenerateConfig): Promise<Buffer> {
  const svg = await satori(
    profileImage ? (
      <TitleAndDescription
        title={title || ""}
        description={description || ""}
      />
    ) : title ? (
      <TitleAndDescription title={title} description={description || ""} />
    ) : (
      <Main />
    ),
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
