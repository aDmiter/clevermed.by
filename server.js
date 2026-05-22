/**
 * Beget + Apache Passenger: Next.js standalone
 * @see docs/BEGET-DEPLOY-FOR-AGENTS.md
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
require("dotenv").config({ path: path.join(root, ".env") });

process.env.NODE_ENV = "production";
process.env.HOSTNAME = "127.0.0.1";

const standaloneDir = path.join(root, ".next", "standalone");
const entry = path.join(standaloneDir, "server.js");

if (!fs.existsSync(entry)) {
  console.error("[clevermed] Не найдена сборка:", entry);
  console.error("[clevermed] Выполните: npm run build");
  process.exit(1);
}

const isPassenger = typeof PhusionPassenger !== "undefined";
if (isPassenger) {
  PhusionPassenger.configure({ autoInstall: false });
}

const originalListen = http.Server.prototype.listen;
http.Server.prototype.listen = function patchedListen(...args) {
  const callback =
    typeof args[args.length - 1] === "function" ? args.pop() : undefined;

  if (isPassenger) {
    return originalListen.call(this, "passenger", callback);
  }

  const port = process.env.PORT || 3002;
  return originalListen.call(this, port, "127.0.0.1", callback);
};

process.chdir(standaloneDir);
require(entry);
