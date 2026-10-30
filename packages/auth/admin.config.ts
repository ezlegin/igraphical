import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getAdminById, getAdminByIdentifier } from "./data/admin";
import { verifyLoginTicket } from "./login-ticket";

export default {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await getAdminById(+user.id!);
        if (!existingUser) return token;
        token.id = user.id;
        return token;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [
    Credentials({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        identifier: {},
        loginToken: {},
      },
      authorize: async (credentials) => {
        const { identifier, loginToken } = credentials as {
          identifier?: string;
          loginToken?: string;
        };

        if (!identifier) {
          throw new Error("Invalid Credentials");
        }

        // Password + OTP are checked in verifyLogin()/verifyOtp(); those are the
        // only functions that can mint a loginToken. Without one, knowing an
        // admin's phone or e-mail must not be enough to obtain a session.
        if (!verifyLoginTicket(loginToken, identifier)) {
          throw new Error("Invalid Credentials");
        }

        const user = await getAdminByIdentifier(identifier);
        if (!user) throw new Error("User Not Found");

        return { id: user.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
