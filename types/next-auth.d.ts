import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    githubId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    dbUserId?: string;
    githubAccessToken?: string;
    githubId?: string;
  }
}
