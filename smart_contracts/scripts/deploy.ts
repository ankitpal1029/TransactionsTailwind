import hre from "hardhat";
import fs from "fs";

const main = async () => {
  const Transactions = await hre.ethers.getContractFactory("Transactions");
  const transactions = await Transactions.deploy();

  await transactions.deployed();

  console.log("Transaction deployed to :", transactions.address);
  let config = `
  export const contractAddress = "${transactions.address}"
  `;

  let data = JSON.stringify(config);
  fs.writeFileSync("contractConfig.js", JSON.parse(data));
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
const run_main = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
run_main();
