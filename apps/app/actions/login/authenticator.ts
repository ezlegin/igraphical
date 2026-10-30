"use server";

import { signIn } from "@igraph/auth";

/**
 * Establishes the session.
 *
 * `loginToken` is REQUIRED and must come from verifyOtp(): it is the signed
 * proof that this identifier passed verification. Without it the Credentials
 * provider refuses to issue a session, so replaying this call with only a phone
 * number or e-mail address (which is what made account takeover possible) no
 * longer authenticates anybody.
 */
export const authenticator = async (identifier: string, loginToken: string) => {
  if (!identifier || !loginToken) return { error: "Invalid credentials" };

  const response = await signIn("user-login", {
    identifier,
    loginToken,
    redirect: false,
  });

  if (response?.error) return { error: "Invalid credentials" };

  return { success: "ورود موفقیت آمیز. خوش آمدید!" };
};
