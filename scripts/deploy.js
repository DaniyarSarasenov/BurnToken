const hre = require("hardhat");
const utils = require("ethers/lib/utils");
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
  
    const Burn = await ethers.getContractFactory(
      "TokenBurn"
    );

    const args = [
      "TestToken",
      "TK",
      utils.parseEther("10000000"),
      "0x2cd2B72b2838947E9D662d70987FE9C34c9c8625",
      "0x2cd2B72b2838947E9D662d70987FE9C34c9c8625"
    ]
     
    const burnContract = await Burn.deploy(
      args[0],args[1],args[2],args[3], args[4]
      // "TestToken",
      // "TK",
      // utils.parseEther("10000000"),
      // "0x2cd2B72b2838947E9D662d70987FE9C34c9c8625",
      // "0x2cd2B72b2838947E9D662d70987FE9C34c9c8625"
      );
    await burnContract.deployed();

    console.log(
      "Burn contract is deployed to address: ",
      burnContract.address
    );

    await hre.run("verify:verify", {
      address: burnContract.address,
      constructorArguments : args
    });
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
    });
  