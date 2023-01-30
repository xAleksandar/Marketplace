require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

// task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
//   const accounts = await hre.ethers.getSigners();

//   for (const account of accounts) {
//     console.log(account.address);
//   }
// });

module.exports = {
  solidity: "0.8.4",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/udeXBeBE8aVQnb7oj2zvSOlJRUhgca5g",
      accounts: ["2c5f126229b66ce34a59a19cc1ce167b6cc1da78a7e42ae72de8cd7680c10844"]
      }
   } 
};
