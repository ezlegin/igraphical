import NextAuth from "next-auth";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { database } from "@igraph/database";
import authConfig from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(database),
  session: { strategy: "jwt" },
  ...authConfig,
});

/**
 * Login tickets: the proof that an identifier was verified server-side.
 * Required by every Credentials `authorize()` callback — see ./login-ticket.ts
 */
export {
  createLoginTicket,
  normalizeIdentifier,
  verifyLoginTicket,
} from "./login-ticket";
