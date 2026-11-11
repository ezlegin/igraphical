import { getSessionAdmin } from "@/data/admin";

/**
 * Server-action guard: returns the session admin with role ADMIN, or null.
 * Server actions are public HTTP endpoints, so every mutation must call this.
 */
export const requireAdmin = async () => {
  const admin = await getSessionAdmin();
  if (!admin || admin.role !== "ADMIN") return null;
  return admin;
};

/** Throws unless the caller is a logged-in admin with role ADMIN. */
export const assertAdmin = async () => {
  if (!(await requireAdmin())) throw new Error("Unauthorized");
};

/** Throws unless the caller is any logged-in admin account (ADMIN or AUTHOR). */
export const assertStaff = async () => {
  if (!(await getSessionAdmin())) throw new Error("Unauthorized");
};
