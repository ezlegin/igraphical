"use server";

import { auth } from "@igraph/auth";
import { database } from "@igraph/database";

const getUserById = async (id: number) => {
  if (!id) return;
  return await database.user.findUnique({
    where: {
      id,
    },
    include: {
      image: true,
      wallet: true,
    },
  });
};

export const getSessionUser = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const user = await getUserById(+userId);
  if (!user) return null;

  // Signed in somewhere else since: this session is no longer valid.
  // Sessions from before this check existed carry no sid and stay valid
  // until the student logs in again.
  const sid = (session as { sid?: string }).sid;
  if (user.activeSessionId && sid !== user.activeSessionId) return null;

  // the session id never leaves the server
  return { ...user, activeSessionId: null };
};
