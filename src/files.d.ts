declare module "*/_authors.yaml" {
  const value: Record<
    string,
    {
      name: string;
      role: string;
      bio: string;
      contacts?: (
        | { github: string }
        | { twitter: string }
        | { facebook: string }
        | { linkedin: string }
        | { medium: string }
        | { hashnode: string }
        | { tistory: string }
      )[];
    }
  >;
  export default value;
}

declare module "*/_nav.yaml" {
  const value: unknown;
  export default value;
}

declare module "*/_redir.yaml" {
  interface Redir {
    old: string;
    new: string;
  }
  const value: Redir[];
  export default value;
}

// supported formats by Sharp (https://sharp.pixelplumbing.com/#formats)
declare module "*.png" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.jpg" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.jpeg" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.webp" {
  import type { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.gif" {
  import type { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.avif" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.tiff" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.tif" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}

declare module "*.svg" {
  import { Picture } from "vite-imagetools";
  const picture: Picture;
  export default picture;
}
