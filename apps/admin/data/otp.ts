// Server-only (not "use server"): only the login action uses it.

import { database } from "@igraph/database";

export const getOtpByIdentifier = async (identifier: string) => {
  return await database.otp.findFirst({
    where: {
      identifier,
    },
  });
};
