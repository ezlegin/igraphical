// Admin uses its own Auth.js cookie names so a student session (app) and an
// admin session never overwrite each other. In production the apps are on
// different hosts anyway; on localhost they share cookies across ports.
const secure = process.env.NODE_ENV !== "development";
const prefix = secure ? "__Secure-" : "";

export const ADMIN_SESSION_COOKIE = `${prefix}igraph-admin.session-token`;

export const adminCookies = {
  sessionToken: { name: ADMIN_SESSION_COOKIE },
  callbackUrl: { name: `${prefix}igraph-admin.callback-url` },
  csrfToken: {
    name: `${secure ? "__Host-" : ""}igraph-admin.csrf-token`,
  },
};
