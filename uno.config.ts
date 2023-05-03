import { defineConfig } from "unocss";
import presetIcons from "@unocss/preset-icons";
import presetWind from "@unocss/preset-wind";
import tailwindConfig from "./tailwind.config.cjs";

export default defineConfig({
  presets: [presetIcons(), presetWind()],
  ...tailwindConfig,
});
