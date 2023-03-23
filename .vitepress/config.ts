import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "ko",
  title: "PortOne 개발자센터",
  description: "포트원 API/SDK로 결제연동하기 위한 정보가 정리되어 있습니다",
  themeConfig: {
    nav: [
      { text: "SDK 놀이터", link: "https://sdk-playground.portone.io/" },
      { text: "문서", link: "/docs/foo" },
    ],

    sidebar: [
      {
        items: [
          { text: "Foo", link: "/docs/foo" },
          { text: "Bar", link: "/docs/bar" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/portone-io/developers.portone.io",
      },
    ],
  },
});
