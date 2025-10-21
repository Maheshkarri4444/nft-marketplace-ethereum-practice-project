const hre = require("hardhat");

async function main() {

  // Load the NFT contract artifacts
  const celoNftContract = await hre.ethers.deployContract("CeloNFT");
  
  // Wait and Deploy the contract
  await celoNftContract.waitForDeployment();

  // Print the address of the NFT contract
  console.log("Celo NFT deployed to:", celoNftContract.target);

  // Load the marketplace contract artifacts
  const NFTMarketplace = await hre.ethers.deployContract(
    "NFTMarketplace"
  );

  // Wait and Deploy the contract
   await NFTMarketplace.waitForDeployment()

  // Log the address of the new contract
  console.log("NFT Marketplace deployed to:", NFTMarketplace.target);

  const [owner] = await hre.ethers.getSigners();

  await owner.sendTransaction({
    to: NFTMarketplace.target,
    value: hre.ethers.parseEther("1.0"), // 1 CELO
  });


  const balance = await hre.ethers.provider.getBalance(NFTMarketplace.target);
  console.log("Marketplace balance:", hre.ethers.formatEther(balance), "CELO");


}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});



//terminal 
// Celo NFT deployed to: 0x9485eFb6CfcDa04EABC42A1F2C5d4Dba229F2970
// NFT Marketplace deployed to: 0x23fcfd0ce16e13bA312bF5e6B16ba4b624D8b751
// Marketplace balance: 1.0 CELO

