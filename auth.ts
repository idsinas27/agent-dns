import { query } from "@/db";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

type DbUser = {
  id: string;
  github_id: string;
  email: string | null;
  image: string | null;
  last_login_at: Date | string | null;
  name: string | null;
};

type GitHubProfile = {
  avatar_url?: string | null;
  email?: string | null;
  id?: number | string | null;
  login?: string | null;
  name?: string | null;
  picture?: string | null;
};

const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  console.log("[auth:init] POSTGRES_URL defined:", Boolean(process.env.POSTGRES_URL));
}

function normalizeGitHubProfile({
  accountProviderId,
  profile,
  user,
}: {
  accountProviderId: string;
  profile: GitHubProfile | undefined;
  user: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  };
}) {
  const githubId =
    profile?.id === null || profile?.id === undefined
      ? accountProviderId
      : String(profile.id);
  const login = profile?.login ?? null;
  const email =
    profile?.email ??
    user.email ??
    (login ? `${login}@users.noreply.github.com` : null);
  const name = profile?.name ?? login ?? user.name ?? `github-${githubId}`;
  const image = profile?.avatar_url ?? profile?.picture ?? user.image ?? null;

  return {
    email,
    githubId,
    image,
    name,
  };
}

function isGitHubProviderId(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value);
}

async function findUserByGithubId(githubId: string) {
  const { rows } = await query<DbUser>(
    `
    SELECT id, github_id, email, name, image, last_login_at
    FROM users
    WHERE github_id = $1
    LIMIT 1
    `,
    [githubId],
  );

  return rows[0] ?? null;
}

async function findUserByEmail(email: string) {
  const { rows } = await query<Pick<DbUser, "id">>(
    `
    SELECT id
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [email],
  );

  return rows[0] ?? null;
}

async function upsertGitHubUser({
  email,
  githubId,
  image,
  name,
}: {
  email: string | null;
  githubId: string;
  image: string | null;
  name: string | null;
}): Promise<DbUser> {
  const id = crypto.randomUUID();

  const { rows } = await query<DbUser>(
    `
    INSERT INTO users (id, github_id, email, name, image)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (github_id)
    DO UPDATE SET
      email = EXCLUDED.email,
      image = EXCLUDED.image,
      last_login_at = NOW(),
      name = EXCLUDED.name
    RETURNING id, github_id, email, name, image, last_login_at
    `,
    [id, githubId, email, name, image],
  );

  if (!rows[0]) {
    throw new Error("GitHub user upsert completed without returning a user row.");
  }

  return rows[0];
}

async function syncGitHubUser({
  accountProviderId,
  profile,
  user,
}: {
  accountProviderId: string;
  profile: GitHubProfile | undefined;
  user: {
    email?: string | null;
    image?: string | null;
    name?: string | null;
  };
}) {
  return upsertGitHubUser(
    normalizeGitHubProfile({
      accountProviderId,
      profile,
      user,
    }),
  );
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      try {
        console.log("[auth:signIn] incoming github payload:", {
          account: account
            ? {
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                type: account.type,
              }
            : null,
          profile: profile
            ? {
                avatar_url: (profile as GitHubProfile).avatar_url,
                email: profile.email,
                id: (profile as GitHubProfile).id,
                login: (profile as GitHubProfile).login,
                name: profile.name,
                picture: profile.picture,
              }
            : null,
          user: {
            email: user.email,
            image: user.image,
            name: user.name,
          },
        });

        if (account?.provider !== "github" || !account.providerAccountId) {
          console.error("[auth:signIn] rejected non-github or missing account id", {
            provider: account?.provider,
            providerAccountId: account?.providerAccountId,
          });
          return false;
        }

        const dbUser = await syncGitHubUser({
          accountProviderId: account.providerAccountId,
          profile: profile as GitHubProfile | undefined,
          user,
        });

        user.id = dbUser.id;
        user.githubId = dbUser.github_id;

        console.log("[auth:signIn] database user synced:", {
          dbUserId: dbUser.id,
          githubId: dbUser.github_id,
          hasEmail: Boolean(dbUser.email),
          hasImage: Boolean(dbUser.image),
          hasName: Boolean(dbUser.name),
        });

        return true;
      } catch (error) {
        console.error("[auth:signIn] failed to sync GitHub user:", error);
        return false;
      }
    },
    async jwt({ account, profile, token, user }) {
      if (account?.provider === "github" && account.providerAccountId) {
        if (typeof user.id === "string" && typeof user.githubId === "string") {
          token.dbUserId = user.id;
          token.githubId = user.githubId;

          return token;
        }

        try {
          const dbUser = await syncGitHubUser({
            accountProviderId: account.providerAccountId,
            profile: profile as GitHubProfile | undefined,
            user: {
              email: user.email ?? token.email ?? null,
              image: user.image ?? token.picture ?? null,
              name: user.name ?? token.name ?? null,
            },
          });

          token.githubId = dbUser.github_id;
          token.dbUserId = dbUser.id;

          console.log("[auth:jwt] token hydrated from database:", {
            dbUserId: dbUser.id,
            githubId: dbUser.github_id,
          });
        } catch (error) {
          console.error("[auth:jwt] failed to hydrate token from database:", error);
        }
      }

      if (!token.dbUserId && !token.githubId && isGitHubProviderId(token.sub)) {
        try {
          const dbUser = await syncGitHubUser({
            accountProviderId: token.sub,
            profile: undefined,
            user: {
              email: token.email,
              image: token.picture,
              name: token.name,
            },
          });

          token.githubId = dbUser.github_id;
          token.dbUserId = dbUser.id;

          console.log("[auth:jwt] legacy token user synced to database:", {
            dbUserId: dbUser.id,
            githubId: dbUser.github_id,
          });
        } catch (error) {
          console.error("[auth:jwt] failed to sync legacy token user:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      let dbUserId =
        typeof token.dbUserId === "string" ? token.dbUserId : undefined;

      if (!dbUserId && typeof token.githubId === "string") {
        try {
          dbUserId = (await findUserByGithubId(token.githubId))?.id;
        } catch (error) {
          console.error("[auth:session] failed to find user by github id:", error);
        }
      }

      if (!dbUserId && session.user?.email) {
        try {
          dbUserId = (await findUserByEmail(session.user.email))?.id;
        } catch (error) {
          console.error("[auth:session] failed to find user by email:", error);
        }
      }

      if (session.user && dbUserId) {
        session.user.id = dbUserId;
        session.user.githubId =
          typeof token.githubId === "string" ? token.githubId : null;
      }

      if (isDev) {
        console.log("[auth:session] session user hydrated:", {
          dbUserId,
          githubId: token.githubId,
          hasSessionUser: Boolean(session.user),
        });
      }

      return session;
    },
  },
});
