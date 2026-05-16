import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { auth } = NextAuth({
  providers: [GitHub],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
});
