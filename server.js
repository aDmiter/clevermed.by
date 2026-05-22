/**
 * Beget + Apache Passenger: Next.js standalone
 * @see docs/BEGET-DEPLOY-FOR-AGENTS.md
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

const root = __dirname;
const logFile = path.join(root, "tmp", "passenger.log");

function log(msg) {
  const line = `${new Date().toISOString()} ${msg}\n`;
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, line);
  } catch {
    // ignore
  }
  console.error(line.trim());
}

try {
  require("dotenv").config({ path: path.join(root, ".env") });
} catch (err) {
  log(`dotenv: ${err.message}`);
}

process.env.NODE_ENV = "production";
process.env.HOSTNAME = "127.0.0.1";

const standaloneDir = path.join(root, ".next", "standalone");
const entry = path.join(standaloneDir, "server.js");

if (!fs.existsSync(entry)) {
  log(`Не найдена сборка: ${entry}`);
  log("Выполните на сервере: npm run build");
  process.exit(1);
}

if (!fs.existsSync(path.join(root, ".env"))) {
  log("Нет файла .env в корне проекта");
}

const isPassenger = typeof PhusionPassenger !== "undefined";
log(`start passenger=${isPassenger} node=${process.version}`);

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

try {
  process.chdir(standaloneDir);
  require(entry);
  log("standalone server.js загружен");
} catch (err) {
  log(err.stack || String(err));
  process.exit(1);
}
