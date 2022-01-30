// https://eth-ropsten.alchemyapi.io/v2/2LoGc2GSYBNOC2gGy5OUSLBCr-c6tgeM
import "@nomiclabs/hardhat-waffle";

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/2LoGc2GSYBNOC2gGy5OUSLBCr-c6tgeM`,
      accounts: [
        "b85b24f81ba14f6e864e535517146bcd7c3ec4f15d319ba1d3c937d5c002d640",
      ],
    },
  },
  solidity: "0.8.4",
};
