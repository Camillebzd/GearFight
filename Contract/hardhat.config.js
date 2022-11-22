require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
// require('@nomiclabs/hardhat-truffle5');
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  // defaultNetwork: "goerli", //à enlever pour les tests
  networks: {
    hardhat: {},
    goerli: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};