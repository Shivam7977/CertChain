const C = window.CERT;
const ZERO = "0x" + "0".repeat(64);
const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
const fmtDate = (ts) => new Date(Number(ts) * 1000).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
const errText = (e) => e.reason || e.shortMessage || e.message || String(e);
const shortAddr = (a) => a.slice(0, 6) + "..." + a.slice(-4);
const shortHash = (h) => h.slice(0, 10) + "..." + h.slice(-6);
const isHash = (h) => /^0x[0-9a-fA-F]{64}$/.test(h || "");

// SHA-256 browser me hi banta hai, file kahin upload nahi hoti
async function sha256(bytes) {
  const d = await crypto.subtle.digest("SHA-256", bytes);
  return "0x" + [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const hashFile = async (file) => sha256(await file.arrayBuffer());
const readContract = () => new ethers.Contract(C.address, C.abi, new ethers.JsonRpcProvider(C.rpcUrl, C.chainId, { staticNetwork: true }));
const verifyLink = (id) => new URL("verify.html?id=" + id, location.href).href;

// Common top bar - har page par same
function renderNav(active) {
  const links = [["index.html", "Home"], ["admin.html", "College admin"], ["verify.html", "Verifier"]]; // owner.html ka link jaan-boojh kar nahi hai
  document.getElementById("top").innerHTML = '<a class="brand" href="index.html">CertChain</a><nav>' +
    links.map(([h, t]) => '<a href="' + h + '"' + (h === active ? ' class="active" aria-current="page"' : "") + ">" + t + "</a>").join("") +
    '</nav><span id="who"></span>';
}

// Login view / dashboard view alag URL hash par, taaki Chrome ka back button website ke andar hi chale
const view = { authed: false, apply() {} };
function applyView(loginEl, dashEl) {
  const dash = view.authed && location.hash === "#dashboard";
  loginEl.classList.toggle("hidden", dash);
  dashEl.classList.toggle("hidden", !dash);
}
function goDashboard() { if (location.hash !== "#dashboard") location.hash = "dashboard"; else view.apply(); }
window.addEventListener("hashchange", () => view.apply());

async function lookupId(id) {
  const r = await readContract().verify(id), c = r.c;
  return { id, exists: c.exists, revoked: c.revoked, name: c.studentName, course: c.course, year: Number(c.year), issuedAt: c.issuedAt, issuer: c.issuer, college: r.collegeName, fileHash: c.fileHash };
}
async function lookupFile(hash) {
  const id = await readContract().idByHash(hash);
  if (id === ZERO) return { exists: false, fileHash: hash };
  return lookupId(id);
}

function showResult(el, r, hint) {
  if (!r.exists) {
    el.className = "msg bad";
    el.innerHTML = "<b>Not found.</b> This certificate was never issued, or the file has been changed. It may be forged." +
      (r.fileHash ? '<div class="hash">File fingerprint: ' + r.fileHash + "</div>" : "");
    return;
  }
  if (r.revoked) {
    el.className = "msg warn";
    el.innerHTML = "<b>Revoked.</b> " + esc(r.college) + " has cancelled this certificate (" + esc(r.name) + ", " + esc(r.course) + ").";
  } else {
    el.className = "msg ok";
    el.innerHTML = "<b>Genuine certificate.</b><br>Student: " + esc(r.name) + "<br>Course: " + esc(r.course) + " (" + r.year +
      ")<br>Issued by: " + esc(r.college) + "<br>Issued on: " + fmtDate(r.issuedAt);
  }
  el.innerHTML += '<div class="hash">Certificate ID: ' + r.id + "<br>College wallet: " + r.issuer + "</div>" + (hint ? '<p class="small">' + esc(hint) + "</p>" : "");
}

// Firebase login helpers (login.html, signup.html, verify.html)
function authInit(say) {
  if (!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) { say("bad", "Login is not set up yet. Fill in frontend/firebase-config.js (see README)."); return null; }
  if (!firebase.apps.length) firebase.initializeApp(window.FIREBASE_CONFIG);
  return firebase.auth();
}
function nextUrl() {
  const n = new URLSearchParams(location.search).get("next");
  return n && /^verify\.html(\?[^#]*)?$/.test(n) ? n : "verify.html";
}
function authErr(e) {
  const m = { "auth/invalid-credential": "Wrong email or password.", "auth/wrong-password": "Wrong email or password.", "auth/user-not-found": "No account found with this email.",
    "auth/email-already-in-use": "An account with this email already exists. Please log in instead.", "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Enter a valid email address.", "auth/too-many-requests": "Too many attempts. Please wait a bit and try again." };
  return m[e.code] || errText(e);
}

// MetaMask connect + Hardhat network switch (owner.html aur admin.html dono use karte hain)
async function connectWallet() {
  if (!window.ethereum) throw new Error("MetaMask is not installed. Install the MetaMask extension and reload.");
  let provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  if (Number((await provider.getNetwork()).chainId) !== C.chainId) {
    const hex = "0x" + C.chainId.toString(16);
    try { await provider.send("wallet_switchEthereumChain", [{ chainId: hex }]); }
    catch (e) {
      if (e.code !== 4902 && e.error?.code !== 4902) throw e;
      await provider.send("wallet_addEthereumChain", [{ chainId: hex, chainName: C.chainName, rpcUrls: [C.rpcUrl], nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 } }]);
    }
    provider = new ethers.BrowserProvider(window.ethereum); // network badalne ke baad naya provider
  }
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return { account, contract: new ethers.Contract(C.address, C.abi, signer) };
}
// Top bar me address + Log out button
function showWho(account, onLogout) {
  document.getElementById("who").innerHTML = '<span class="small">' + shortAddr(account) + '</span> <button class="ghost" id="logout" style="margin:0 0 0 8px;padding:6px 12px">Log out</button>';
  document.getElementById("logout").onclick = () => { document.getElementById("who").innerHTML = ""; onLogout(); };
}