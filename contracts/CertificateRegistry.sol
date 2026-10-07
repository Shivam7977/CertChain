// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title CertificateRegistry - kai colleges, har college ka apna admin wallet
/// Platform owner colleges register karta hai; college admin sirf apne certificates issue/revoke kar sakta hai.
contract CertificateRegistry {
    struct College { string name; bool active; }
    struct Certificate {
        bytes32 fileHash;   // final (QR laga hua) PDF ka SHA-256
        address issuer;     // jis college wallet ne issue kiya
        string studentName;
        string course;
        uint16 year;
        uint64 issuedAt;
        bool exists;
        bool revoked;
    }

    address public immutable owner; // platform owner (deployer)
    mapping(address => College) public colleges;
    mapping(bytes32 => Certificate) private certs;   // certificate ID => data
    mapping(bytes32 => bytes32) public idByHash;     // file hash => certificate ID

    event CollegeRegistered(address indexed admin, string name);
    event CollegeStatus(address indexed admin, bool active);
    event CertificateIssued(bytes32 indexed id, address indexed issuer, bytes32 fileHash, string studentName, string course, uint16 year);
    event CertificateRevoked(bytes32 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the platform owner can do this");
        _;
    }
    modifier onlyCollege() {
        require(colleges[msg.sender].active, "Only an approved college admin can do this");
        _;
    }

    constructor() { owner = msg.sender; }

    function registerCollege(address admin, string memory name) external onlyOwner {
        require(admin != address(0), "Invalid wallet address");
        require(bytes(name).length > 0, "College name is required");
        require(bytes(colleges[admin].name).length == 0, "This wallet is already registered");
        colleges[admin] = College(name, true);
        emit CollegeRegistered(admin, name);
    }

    function setCollegeActive(address admin, bool active) external onlyOwner {
        require(bytes(colleges[admin].name).length > 0, "College not found");
        colleges[admin].active = active;
        emit CollegeStatus(admin, active);
    }

    function issue(bytes32 id, bytes32 fileHash, string memory studentName, string memory course, uint16 year) external onlyCollege {
        require(id != bytes32(0) && !certs[id].exists, "Certificate ID already used");
        require(idByHash[fileHash] == bytes32(0), "This file has already been issued");
        require(bytes(studentName).length > 0 && bytes(course).length > 0, "Name and course are required");
        Certificate storage c = certs[id];
        c.fileHash = fileHash;
        c.issuer = msg.sender;
        c.studentName = studentName;
        c.course = course;
        c.year = year;
        c.issuedAt = uint64(block.timestamp);
        c.exists = true;
        idByHash[fileHash] = id;
        emit CertificateIssued(id, msg.sender, fileHash, studentName, course, year);
    }

    function revoke(bytes32 id) external {
        Certificate storage c = certs[id];
        require(c.exists, "Certificate not found");
        require(c.issuer == msg.sender, "Only the issuing college can revoke");
        require(!c.revoked, "Certificate already revoked");
        c.revoked = true;
        emit CertificateRevoked(id);
    }

    function verify(bytes32 id) external view returns (Certificate memory c, string memory collegeName) {
        c = certs[id];
        collegeName = colleges[c.issuer].name;
    }
}
