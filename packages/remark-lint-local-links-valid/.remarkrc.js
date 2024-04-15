// @ts-check

export default {
  plugins: [
    [
      "remark-lint-local-links-valid",
      { baseDir: "../../src/content", excludePaths: ["/api"] },
    ],
  ],
};
