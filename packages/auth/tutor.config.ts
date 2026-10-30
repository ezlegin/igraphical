import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getTutorById, getTutorByIdentifier } from "./data/tutor";
import { verifyLoginTicket } from "./login-ticket";

export default {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await getTutorById(+user.id!);
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
      id: "tutor-login",
      name: "Tutor Login",
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
        // only functions that can mint a loginToken.
        if (!verifyLoginTicket(loginToken, identifier)) {
          throw new Error("Invalid Credentials");
        }

        const user = await getTutorByIdentifier(identifier);
        if (!user) throw new Error("User Not Found");

        return { id: user.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
