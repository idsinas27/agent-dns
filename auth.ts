import { sql } from "@vercel/postgres";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

type DbUser = {
  id: string;
  github_id: string;
};

type GitHubProfile = {
  avatar_url?: string | null;
  email?: string | null;
  id?: number | string | null;
  login?: string | null;
  name?: string | null;
  picture?: string | null;
};

async function findUserByGithubId(githubId: string) {
  const { rows } = await sql<DbUser>`
    SELECT id, github_id
    FROM users
    WHERE github_id = ${githubId}
    LIMIT 1
  `;

  return rows[0] ?? null;
}

async function findUserByEmail(email: string) {
  const { rows } = await sql<Pick<DbUser, "id">>`
    SELECT id
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

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
}) {
  const existingUser = await findUserByGithubId(githubId);

  if (existingUser) {
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, image = ${image}
      WHERE github_id = ${githubId}
    `;

    return existingUser.id;
  }

  const id = crypto.randomUUID();

  await sql`
    INSERT INTO users (id, github_id, email, name, image)
    VALUES (${id}, ${githubId}, ${email}, ${name}, ${image})
  `;

  return id;
}

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  providers: [GitHub],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "github" || !account.providerAccountId) {
        return false;
      }

      const githubProfile = profile as GitHubProfile | undefined;
      const githubId = account.providerAccountId;
      const email = githubProfile?.email ?? user.email ?? null;
      const name = githubProfile?.name ?? githubProfile?.login ?? user.name ?? null;
      const image =
        githubProfile?.avatar_url ?? githubProfile?.picture ?? user.image ?? null;

      await upsertGitHubUser({
        email,
        githubId,
        image,
        name,
      });

      return true;
    },
    async jwt({ account, profile, token, user }) {
      if (account?.provider === "github" && account.providerAccountId) {
        const githubProfile = profile as GitHubProfile | undefined;
        const githubId = account.providerAccountId;
        const email = githubProfile?.email ?? user.email ?? token.email ?? null;
        const name =
          githubProfile?.name ?? githubProfile?.login ?? user.name ?? token.name ?? null;
        const image =
          githubProfile?.avatar_url ??
          githubProfile?.picture ??
          user.image ??
          token.picture ??
          null;

        token.githubId = githubId;
        token.dbUserId = await upsertGitHubUser({
          email,
          githubId,
          image,
          name,
        });
      }

      return token;
    },
    async session({ session, token }) {
      let dbUserId =
        typeof token.dbUserId === "string" ? token.dbUserId : undefined;

      if (!dbUserId && typeof token.githubId === "string") {
        dbUserId = (await findUserByGithubId(token.githubId))?.id;
      }

      if (!dbUserId && session.user?.email) {
        dbUserId = (await findUserByEmail(session.user.email))?.id;
      }

      if (session.user && dbUserId) {
        session.user.id = dbUserId;
        session.user.githubId =
          typeof token.githubId === "string" ? token.githubId : null;
      }

      return session;
    },
  },
});
