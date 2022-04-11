const hre = require("hardhat");

async function main() {
  const X = await hre.ethers.getContractFactory("NFTFactory");
  const x = await X.deploy();
  await x.deployed();
  console.log("NFTFactory deployed to:", x.address);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
