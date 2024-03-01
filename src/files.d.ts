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

declare module "*?base64" {
  const base64: string;
  export default base64;
}
