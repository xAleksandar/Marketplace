async function main() {
  
  const NFTFactory = await ethers.getContractFactory("NFTFactory");
  const nftfactory = await NFTFactory.deploy();
  const nftfactoryAddress = nftfactory.address;
  saveFrontendFiles(nftfactory , "NFTFactory");
  console.log('NFTfactory deployed at: ', nftfactory.address);

  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(nftfactoryAddress);
  saveFrontendFiles(marketplace , "Marketplace");
  console.log('Marketplace deployed at: ', marketplace.address);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy("Victoria", "VIKI");
  saveFrontendFiles(nft, "NFT");
  console.log('NFT Contract deployed at: ', nft.address);
}

function saveFrontendFiles(contract, name) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify({ address: contract.address }, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });