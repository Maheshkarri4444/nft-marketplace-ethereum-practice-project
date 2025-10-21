require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

// Add the alfajores network to the configuration
module.exports = {
  solidity: "0.8.20",
  networks: {
    celoSepolia: {
      url: process.env.RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11142220, // Chain ID for the sepolia Network
    },
  },
};