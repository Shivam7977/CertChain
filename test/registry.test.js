const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CertificateRegistry", () => {
  let reg, owner, collegeA, collegeB, other;
  const id1 = ethers.hexlify(ethers.randomBytes(32));
  const h1 = ethers.sha256(ethers.toUtf8Bytes("file-1"));

  beforeEach(async () => {
    [owner, collegeA, collegeB, other] = await ethers.getSigners();
    reg = await (await ethers.getContractFactory("CertificateRegistry")).deploy();
    await reg.registerCollege(collegeA.address, "College A");
    await reg.registerCollege(collegeB.address, "College B");
  });

  it("only the owner can register colleges", async () => {
    await expect(reg.connect(other).registerCollege(other.address, "X")).to.be.revertedWith("Only the platform owner can do this");
    await expect(reg.registerCollege(collegeA.address, "Again")).to.be.revertedWith("This wallet is already registered");
  });

  it("unregistered wallet cannot issue", async () => {
    await expect(reg.connect(other).issue(id1, h1, "S", "C", 2026)).to.be.revertedWith("Only an approved college admin can do this");
  });

  it("college issues and anyone verifies by id and by file hash", async () => {
    await reg.connect(collegeA).issue(id1, h1, "Asha Patil", "B.E. CSE", 2026);
    const r = await reg.connect(other).verify(id1);
    expect(r.c.exists).to.equal(true);
    expect(r.c.studentName).to.equal("Asha Patil");
    expect(r.collegeName).to.equal("College A");
    expect(await reg.idByHash(h1)).to.equal(id1);
  });

  it("blocks duplicate id and duplicate file", async () => {
    await reg.connect(collegeA).issue(id1, h1, "A", "C", 2026);
    await expect(reg.connect(collegeA).issue(id1, ethers.sha256("0x01"), "A", "C", 2026)).to.be.revertedWith("Certificate ID already used");
    await expect(reg.connect(collegeB).issue(ethers.hexlify(ethers.randomBytes(32)), h1, "A", "C", 2026)).to.be.revertedWith("This file has already been issued");
  });

  it("only the issuing college can revoke", async () => {
    await reg.connect(collegeA).issue(id1, h1, "A", "C", 2026);
    await expect(reg.connect(collegeB).revoke(id1)).to.be.revertedWith("Only the issuing college can revoke");
    await expect(reg.revoke(id1)).to.be.revertedWith("Only the issuing college can revoke");
    await reg.connect(collegeA).revoke(id1);
    expect((await reg.verify(id1)).c.revoked).to.equal(true);
    await expect(reg.connect(collegeA).revoke(id1)).to.be.revertedWith("Certificate already revoked");
  });

  it("suspended college cannot issue; unknown id is not found", async () => {
    await reg.setCollegeActive(collegeA.address, false);
    await expect(reg.connect(collegeA).issue(id1, h1, "A", "C", 2026)).to.be.revertedWith("Only an approved college admin can do this");
    expect((await reg.verify(id1)).c.exists).to.equal(false);
    expect(await reg.idByHash(h1)).to.equal(ethers.ZeroHash);
  });
});
