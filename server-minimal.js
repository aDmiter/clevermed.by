/**
 * Тест Passenger на Beget. В ~/clevermed.by/.htaccess временно:
 * PassengerStartupFile server-minimal.js
 * Если в браузере «clevermed ok» — Passenger и Node работают.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

const logFile = path.join(__dirname, "tmp", "passenger.log");
function log(msg) {
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, `${new Date().toISOString()} ${msg}\n`);
  } catch {
    // ignore
  }
}

try {
  log(`start PhusionPassenger=${typeof PhusionPassenger}`);
  if (typeof PhusionPassenger !== "undefined") {
    PhusionPassenger.configure({ autoInstall: false });
  }
  http
    .createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("clevermed ok");
    })
    .listen(
      typeof PhusionPassenger !== "undefined" ? "passenger" : 3002,
      "127.0.0.1",
      () => {
        log("listening");
      },
    );
} catch (err) {
  log(err.stack || String(err));
  throw err;
}
