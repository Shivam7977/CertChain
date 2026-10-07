// Ek hi command me: local chain + deploy + website (npm start)
const { spawn } = require("child_process");
const http = require("http");
const net = require("net");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "frontend");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };
const run = (cmd) => spawn(cmd, { shell: true, stdio: "inherit" });
const isOpen = (port) => new Promise((ok) => {
  const s = net.connect(port, "127.0.0.1");
  s.on("connect", () => { s.destroy(); ok(true); });
  s.on("error", () => ok(false));
});

async function main() {
  if (await isOpen(8545)) { console.error("Port 8545 is already in use. Close the other terminal running 'npm run node' and try again."); process.exit(1); }
  if (await isOpen(3000)) { console.error("Port 3000 is already in use. Close the other terminal running the website and try again."); process.exit(1); }

  const chain = run("npx hardhat node");
  process.on("exit", () => chain.kill());
  chain.on("exit", () => process.exit(0));

  for (let i = 0; i < 120 && !(await isOpen(8545)); i++) await new Promise((r) => setTimeout(r, 500));
  if (!(await isOpen(8545))) { console.error("The local chain did not start in 60 seconds."); process.exit(1); }

  const deploy = run("npx hardhat run scripts/deploy.js --network localhost");
  deploy.on("close", (code) => {
    if (code !== 0) { console.error("Deploy failed, stopping."); process.exit(1); }
    http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/index.html";
      const f = path.join(root, path.normalize(p));
      if (!f.startsWith(root)) { res.writeHead(403); return res.end("Forbidden"); }
      fs.readFile(f, (e, d) => {
        if (e) { res.writeHead(404); return res.end("Not found"); }
        res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
        res.end(d);
      });
    }).listen(3000, () => {
      console.log("\n=======================================================");
      console.log("Ready! Open http://localhost:3000 in your browser.");
      console.log("Platform owner wallet: import the private key of Account #0 (printed above) into MetaMask.");
      console.log("Press Ctrl+C to stop everything.");
      console.log("=======================================================");
    });
  });
}
main();
