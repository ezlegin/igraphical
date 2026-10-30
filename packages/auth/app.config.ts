import Credentials from "next-auth/providers/credentials";
import { NextAuthConfig } from "next-auth";
import { getUserById, getUserByIdentifier } from "./data/user";
import { verifyLoginTicket } from "./login-ticket";

export default {
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const existingUser = await getUserById(+user.id!);
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
      id: "user-login",
      name: "User Login",
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
          throw new Error("لطفا اطلاعات را وارد کنید.");
        }

        // An identifier alone is NOT a credential. `loginToken` is minted only
        // by verifyOtp() after the OTP code has been checked, so this rejects
        // anyone trying to call the login action directly and skip verification.
        if (!verifyLoginTicket(loginToken, identifier)) {
          throw new Error("Invalid Credentials");
        }

        const user = await getUserByIdentifier(identifier);
        if (!user) throw new Error("User Not Found");

        return { id: user.id.toString() };
      },
    }),
  ],
} satisfies NextAuthConfig;
