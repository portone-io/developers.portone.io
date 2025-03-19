import { describe, expect, it } from "vitest";

import { generateSlug } from "./slugs";

describe("generateSlug", () => {
  const config = {
    opi: {
      path: "src/routes/(root)/opi",
    },
    releaseNotes: {
      path: "src/routes/(root)/release-notes/(note)",
    },
    blog: {
      path: "src/routes/(root)/blog/posts",
    },
    platform: {
      path: "src/routes/(root)/platform",
    },
    sdk: {
      path: "src/routes/(root)/sdk",
    },
  };

  it("should generate correct slug for opi path", () => {
    const filePath = "src/routes/(root)/opi/ko/console/guide/account.mdx";
    const basePath = config.opi.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("ko/console/guide/account");
  });

  it("should generate correct slug for opi index file", () => {
    const filePath = "src/routes/(root)/opi/ko/console/guide/readme/index.mdx";
    const basePath = config.opi.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("ko/console/guide/readme");
  });

  it("should generate correct slug for release notes path", () => {
    const filePath =
      "src/routes/(root)/release-notes/(note)/platform/2023-12-15.mdx";
    const basePath = config.releaseNotes.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("platform/2023-12-15");
  });

  it("should generate correct slug for blog posts path", () => {
    const filePath = "src/routes/(root)/blog/posts/2024-02/v2-oom.mdx";
    const basePath = config.blog.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("2024-02/v2-oom");
  });

  it("should generate correct slug for platform path", () => {
    const filePath = "src/routes/(root)/platform/ko/usages/partner.mdx";
    const basePath = config.platform.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("ko/usages/partner");
  });

  it("should generate correct slug for api path", () => {
    const filePath = "src/routes/(root)/api/backward-compatibility.mdx";
    const basePath = "src/routes/(root)/api";
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("backward-compatibility");
  });

  it("should handle nested directories correctly", () => {
    const filePath =
      "src/routes/(root)/opi/ko/extra/identity-verification/v1/all/0.mdx";
    const basePath = config.opi.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("ko/extra/identity-verification/v1/all/0");
  });

  it("should return empty string for non-matching paths", () => {
    const filePath = "src/routes/different-path/file.mdx";
    const basePath = config.opi.path;
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("");
  });

  it("should remove path components wrapped in parentheses", () => {
    const filePath =
      "src/routes/(root)/release-notes/(note)/api-sdk/2023-04-24.mdx";
    const basePath = "src/routes/(root)";
    const slug = generateSlug(filePath, basePath);
    expect(slug).toBe("release-notes/api-sdk/2023-04-24");
  });
});
