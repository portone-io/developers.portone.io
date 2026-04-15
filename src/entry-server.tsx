// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

import { themeStorageKey } from "./state/theme";

const themeInitializer = `
(() => {
  const storageKey = ${JSON.stringify(themeStorageKey)};
  const parseTheme = (value) => value === "light" || value === "dark" ? value : null;
  const storedTheme = parseTheme(window.localStorage.getItem(storageKey));
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const theme = storedTheme ?? systemTheme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
`;

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en" data-theme="light">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" type="image/png" href="/favicon.png" />
          <script innerHTML={themeInitializer} />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
