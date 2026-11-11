import appConfig from "./app.config";
import adminConfig from "./admin.config";
import { NextAuthConfig } from "next-auth";

const target = process.env.AUTH_APP as "app" | "admin";

let config: NextAuthConfig;

switch (target) {
  case "app":
    config = appConfig;
    break;
  case "admin":
    config = adminConfig;
    break;
}

export default config;
