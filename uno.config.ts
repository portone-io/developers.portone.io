import presetIcons from "@unocss/preset-icons";
import presetWind from "@unocss/preset-wind";
import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

const zIndex = {
  search: 12,
  gnb: 11,
  "gnb-body": 10,
  "dropdown-link": 9,
  "left-sidebar": 8,
  "overlay-dim": 2,
  "selected-tab": 1,
};

export default defineConfig({
  presets: [presetIcons(), presetWind()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    colors: {
      portone: "#FC6B2D",
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
