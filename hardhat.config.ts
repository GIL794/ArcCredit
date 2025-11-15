require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Faucet testnet (change values based on your testnet)
    "faucet-testnet": {
      url: process.env.FAUCET_RPC || "https://rpc.faucetnet.example/",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.FAUCET_CHAIN_ID || "11155111"), // Sepolia by default
    },
    // Local Hardhat network (default, runs in-memory)
    hardhat: {
      allowUnlimitedContractSize: true,
      chainId: 31337,
    },
    // Localhost (start with: npx hardhat node)
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Arc testnet (if RPC becomes available)
    "arc-testnet": {
      url: process.env.ARC_TESTNET_RPC || "https://testnet.arc.eco/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 5042002,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      "arc-testnet": process.env.ARC_EXPLORER_API_KEY || "",
      "faucet-testnet": process.env.FAUCET_EXPLORER_API_KEY || "",
    },
  },
};
