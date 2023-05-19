import { GraphQLClient } from "graphql-request";
import { getSdk } from "./__generated__/githubClient";

const githubSdk = getSdk(
  new GraphQLClient("https://api.github.com/graphql", {
    headers: {
      "User-Agent": "graphql-request",
      Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
    },
  })
);

export default githubSdk;
