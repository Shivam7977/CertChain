// Deploy ke baad chalao: register college -> issue -> verify -> tamper -> revoke
const hre = require("hardhat");
const fs = require("fs");
const crypto = require("crypto");

async function main() {
  const window = {};
  eval(fs.readFileSync(__dirname + "/../frontend/contract.js", "utf8"));
  const C = window.CERT;
  const [owner, college, other] = await hre.ethers.getSigners();
  const c = new hre.ethers.Contract(C.address, C.abi, owner);
  const cc = c.connect(college);
  const sha = (b) => "0x" + crypto.createHash("sha256").update(b).digest("hex");
  const assert = (ok, msg) => { if (!ok) throw new Error("FAILED: " + msg); console.log("OK:", msg); };
  const fails = async (p) => { try { await p; return false; } catch { return true; } };

  await (await c.registerCollege(college.address, "Test College")).wait();
  const id = "0x" + crypto.randomBytes(32).toString("hex");
  const file = Buffer.from("%PDF stamped certificate bytes");
  const h = sha(file);
  await (await cc.issue(id, h, "Asha Patil", "B.E. CSE", 2026)).wait();
  let r = await c.verify(id);
  assert(r.c.exists && !r.c.revoked && r.c.studentName === "Asha Patil" && r.collegeName === "Test College", "issued certificate verifies by ID");
  assert((await c.idByHash(h)) === id, "file hash maps back to the ID");
  const t = Buffer.from(file); t[5] ^= 1;
  assert((await c.idByHash(sha(t))) === hre.ethers.ZeroHash, "tampered file is not found");
  assert(await fails(c.connect(other).issue("0x" + "11".repeat(32), sha("x"), "A", "B", 2026)), "unregistered wallet cannot issue");
  assert(await fails(c.revoke(id)), "platform owner cannot revoke another college's certificate");
  const logs = await c.queryFilter(c.filters.CertificateIssued(null, college.address), C.deployBlock);
  assert(logs.length === 1 && logs[0].args.id === id, "per-college list query works");
  await (await cc.revoke(id)).wait();
  assert((await c.verify(id)).c.revoked, "revoked certificate shows revoked");
}
main().catch((e) => { console.error(e.message); process.exit(1); });
