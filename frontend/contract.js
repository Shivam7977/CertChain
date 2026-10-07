window.CERT = {
  "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  "abi": [
    {
      "type": "constructor",
      "stateMutability": "undefined",
      "payable": false,
      "inputs": []
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "CertificateIssued",
      "inputs": [
        {
          "type": "bytes32",
          "name": "id",
          "indexed": true
        },
        {
          "type": "address",
          "name": "issuer",
          "indexed": true
        },
        {
          "type": "bytes32",
          "name": "fileHash",
          "indexed": false
        },
        {
          "type": "string",
          "name": "studentName",
          "indexed": false
        },
        {
          "type": "string",
          "name": "course",
          "indexed": false
        },
        {
          "type": "uint16",
          "name": "year",
          "indexed": false
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "CertificateRevoked",
      "inputs": [
        {
          "type": "bytes32",
          "name": "id",
          "indexed": true
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "CollegeRegistered",
      "inputs": [
        {
          "type": "address",
          "name": "admin",
          "indexed": true
        },
        {
          "type": "string",
          "name": "name",
          "indexed": false
        }
      ]
    },
    {
      "type": "event",
      "anonymous": false,
      "name": "CollegeStatus",
      "inputs": [
        {
          "type": "address",
          "name": "admin",
          "indexed": true
        },
        {
          "type": "bool",
          "name": "active",
          "indexed": false
        }
      ]
    },
    {
      "type": "function",
      "name": "colleges",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": ""
        }
      ],
      "outputs": [
        {
          "type": "string",
          "name": "name"
        },
        {
          "type": "bool",
          "name": "active"
        }
      ]
    },
    {
      "type": "function",
      "name": "idByHash",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "bytes32",
          "name": ""
        }
      ],
      "outputs": [
        {
          "type": "bytes32",
          "name": ""
        }
      ]
    },
    {
      "type": "function",
      "name": "issue",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "bytes32",
          "name": "id"
        },
        {
          "type": "bytes32",
          "name": "fileHash"
        },
        {
          "type": "string",
          "name": "studentName"
        },
        {
          "type": "string",
          "name": "course"
        },
        {
          "type": "uint16",
          "name": "year"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "owner",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [],
      "outputs": [
        {
          "type": "address",
          "name": ""
        }
      ]
    },
    {
      "type": "function",
      "name": "registerCollege",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": "admin"
        },
        {
          "type": "string",
          "name": "name"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "revoke",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "bytes32",
          "name": "id"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "setCollegeActive",
      "constant": false,
      "payable": false,
      "inputs": [
        {
          "type": "address",
          "name": "admin"
        },
        {
          "type": "bool",
          "name": "active"
        }
      ],
      "outputs": []
    },
    {
      "type": "function",
      "name": "verify",
      "constant": true,
      "stateMutability": "view",
      "payable": false,
      "inputs": [
        {
          "type": "bytes32",
          "name": "id"
        }
      ],
      "outputs": [
        {
          "type": "tuple",
          "name": "c",
          "components": [
            {
              "type": "bytes32",
              "name": "fileHash"
            },
            {
              "type": "address",
              "name": "issuer"
            },
            {
              "type": "string",
              "name": "studentName"
            },
            {
              "type": "string",
              "name": "course"
            },
            {
              "type": "uint16",
              "name": "year"
            },
            {
              "type": "uint64",
              "name": "issuedAt"
            },
            {
              "type": "bool",
              "name": "exists"
            },
            {
              "type": "bool",
              "name": "revoked"
            }
          ]
        },
        {
          "type": "string",
          "name": "collegeName"
        }
      ]
    }
  ],
  "chainId": 31337,
  "deployBlock": 1,
  "chainName": "Hardhat Local",
  "rpcUrl": "http://127.0.0.1:8545",
  "explorer": ""
};
