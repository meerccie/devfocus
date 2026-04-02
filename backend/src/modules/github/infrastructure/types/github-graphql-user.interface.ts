export interface GithubGraphqlUser {
  user: {
    id: string;
    login: string;
    name: string | null;
    avatarUrl: string;
    bio: string | null;
    repositories: {
      nodes: Array<{
        name: string;
        defaultBranchRef: {
          target: {
            history: {
              totalCount: number;
            };
          };
        } | null;
      }>;
    };
  } | null;
  errors?: Array<{ message: string }>;
}

/**
 * Octokit's .request method wraps the raw body in a 'data' property.
 * This envelope represents the standard response for a GraphQL POST.
 */
export interface GraphQLResponseEnvelope<T> {
  data: T;
  headers: Record<string, string | undefined>;
}
