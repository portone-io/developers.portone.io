import presetIcons from "@unocss/preset-icons";
import { presetWebFonts } from "@unocss/preset-web-fonts";
import presetWind from "@unocss/preset-wind";
import {
  defineConfig,
  type Preset,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

const zIndex = {
  search: 13,
  "parameter-hover": 12,
  gnb: 11,
  "gnb-body": 10,
  "dropdown-link": 9,
  "left-sidebar": 8,
  "overlay-dim": 2,
  "selected-tab": 1,
  "sticky-layout": 3,
};

export default defineConfig({
  presets: [
    presetIcons(),
    presetWind(),
    presetWebFonts({
      provider: "none",
      fonts: {
        mono: "GeistMono",
      },
    }) as Preset<object>,
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      portone: "#FC6B2D",
    },
    maxWidth: {
      "8xl": "90rem",
    },
    zIndex,
  },
  blocklist: [
    // z-index 숫자로 넣는 것 비활성화
    /^z-\d+$/,
  ],
  // 이름 붙여 정의된 z-index 값들을 z-$name 꼴로 사용
  rules: [
    [
      /^z-(.*)$/,
      ([, name]) => {
        if (name && name in zIndex) {
          return { "z-index": zIndex[name as keyof typeof zIndex] };
        }
        return;
      },
      { autocomplete: "z-$zIndex" },
    ],
  ],
});
