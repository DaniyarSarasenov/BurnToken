require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("prettier-dotenv").config();
require("hardhat-gas-reporter");
require("solidity-coverage");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.15",
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      polygonMumbai: process.env.MUMBAI_API_KEY
    },
  },
  networks: {
    goerli: {
      url: process.env.ALCHEMY_TEST_URI,
      accounts: [process.env.PRIVATE_KEY],
    },
    polygonMumbai: {
      url: process.env.ALCHEMY_MUMBAI_TEST_URI,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      url: process.env.ALCHEMY_MAIN_URI,
      accounts: [process.env.PRIVATE_KEY],
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};
