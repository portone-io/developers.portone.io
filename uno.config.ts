import presetIcons from "@unocss/preset-icons";
import presetWind from "@unocss/preset-wind";
import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [presetIcons(), presetWind()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    extend: {
      colors: {
        portone: "#FC6B2D",
      },
    },
  },
});
