import type { DocsEntry } from "~/content/config";
import type { SystemVersion } from "~/type";

const pathMappings: Record<string, string> = {
  "/api/rest-v1": "/api/rest-v2",
  "/api/rest-v2": "/api/rest-v1",
};

export function navigateAfterVersionSwitch(options: {
  pathname: string;
  newVersion: SystemVersion;
  navigate: (path: string) => void;
  versionVariants?: DocsEntry["versionVariants"];
  targetVersions?: SystemVersion[];
}): void {
  const { pathname, newVersion, navigate, versionVariants, targetVersions } =
    options;

  const mappedPath =
    Object.entries(pathMappings).find(([from]) =>
      pathname.startsWith(from),
    )?.[1] ??
    (versionVariants?.[newVersion] && versionVariants[newVersion]);

  if (mappedPath) {
    navigate(mappedPath);
  } else if (
    ["/opi/", "/sdk/"].some((path) => pathname.startsWith(path))
  ) {
    if (targetVersions && !targetVersions.includes(newVersion)) {
      const match = pathname.match(/^\/(\w+)\/(\w+)\//);
      navigate(match ? `/${match[1]}/${match[2]}` : "/");
    }
  } else {
    navigate("/");
  }
}
