"use server";

import { signIn } from "@igraph/auth";
import { redirect } from "next/navigation";

export const authenticator = async (identifier: string, loginToken: string) => {
  if (!identifier || !loginToken) return { error: "Invalid Credentials" };

  const res = await signIn("admin-login", {
    identifier,
    loginToken,
    redirect: false,
  });

  if (res.error) return { error: "Invalid Credentials" };

  redirect("/");
};
