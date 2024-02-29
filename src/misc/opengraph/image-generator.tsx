/** @jsxImportSource ./jsx */

import satori from "satori";
import sharp from "sharp";

import BlogPost from "./components/BlogPost";
import Main from "./components/Main";
import TitleAndDescription from "./components/TitleAndDescription";

const pretendardVariants = [
  "Pretendard-Medium",
  "Pretendard-Bold",
  "Pretendard-ExtraBold",
] as const;
const pretendardPromises = Object.fromEntries(
  pretendardVariants.map((variant) => [
    variant,
    fetch(
      `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/${variant}.otf`,
    ).then((res) => res.arrayBuffer()),
  ]),
) as { [key in (typeof pretendardVariants)[number]]: Promise<ArrayBuffer> };

interface GenerateConfig {
  name?: string;
  role?: string;
  profileImage?: string;
  title?: string;
  description?: string;
}
export async function generate({
  name,
  role,
  profileImage,
  title,
  description,
}: GenerateConfig): Promise<Buffer> {
  const svg = await satori(
    name && profileImage ? (
      <BlogPost
        name={name}
        role={role}
        profileImage={profileImage}
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
      height: 630,
      embedFont: true,
      fonts: [
        {
          name: "Pretendard",
          data: await pretendardPromises["Pretendard-Medium"],
          weight: 400,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: await pretendardPromises["Pretendard-Bold"],
          weight: 700,
          style: "normal",
        },
        {
          name: "Pretendard",
          data: await pretendardPromises["Pretendard-ExtraBold"],
          weight: 800,
          style: "normal",
        },
      ],
    },
  ).catch((e) => (console.log(e), Promise.reject(e)));
  return await sharp(Buffer.from(svg)).toBuffer();
}
