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
