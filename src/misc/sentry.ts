import type * as Sentry from "@sentry/solidstart";

const deniedNetworkKeys = ["forwarded", "-ip", "remote-", "via", "-user"];

export const sentryDataCollection = {
  userInfo: false,
  cookies: false,
  httpHeaders: {
    request: { deny: deniedNetworkKeys },
    response: { deny: deniedNetworkKeys },
  },
  httpBodies: [],
  urlQueryParams: { deny: deniedNetworkKeys },
  genAI: { inputs: false, outputs: false },
  databaseQueryData: false,
  queues: false,
  graphQL: { document: false, variables: false },
} satisfies NonNullable<Parameters<typeof Sentry.init>[0]["dataCollection"]>;
