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
