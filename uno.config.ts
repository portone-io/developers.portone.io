import {
  defineConfig,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import presetIcons from "@unocss/preset-icons";
import presetWind from "@unocss/preset-wind";
import tailwindConfig from "./tailwind.config.cjs";

export default defineConfig({
  // TODO: Upgrade unocss
  presets: [presetIcons(), presetWind() as any],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  ...tailwindConfig,
  theme: {
    colors: {
      portone: "#FC6B2D",
    },
  },
});
