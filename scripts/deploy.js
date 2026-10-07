const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const factory = await hre.ethers.getContractFactory("CertificateRegistry");
  const reg = await factory.deploy();
  await reg.waitForDeployment();
  const receipt = await reg.deploymentTransaction().wait();
  const address = await reg.getAddress();
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);
  const sepolia = chainId === 11155111;

  const cfg = {
    address,
    abi: JSON.parse(reg.interface.formatJson()),
    chainId,
    deployBlock: receipt.blockNumber,
    chainName: sepolia ? "Sepolia" : "Hardhat Local",
    rpcUrl: sepolia ? "https://ethereum-sepolia-rpc.publicnode.com" : "http://127.0.0.1:8545",
    explorer: sepolia ? "https://sepolia.etherscan.io" : "",
  };
  // frontend ko address aur ABI yahin se milta hai
  fs.writeFileSync(path.join(__dirname, "..", "frontend", "contract.js"), "window.CERT = " + JSON.stringify(cfg, null, 2) + ";\n");
  console.log("Contract deployed to:", address);
  console.log("Platform owner (deployer wallet) can now register colleges from the admin page.");
  if (sepolia) console.log("View on Etherscan:", cfg.explorer + "/address/" + address);
}
main().catch((e) => { console.error("Deploy failed:", e.message); process.exit(1); });
