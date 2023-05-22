const hre = require("hardhat");
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);
  
    const Burn = await ethers.getContractFactory(
      "TokenBurn"
    );

    const args = [
      "TestToken",
      "TK",
      1000000000000000000000000,
      0x0000000000000000000000000000,
      0x0000000000000000000000000000
    ]
     
    const burnContract = await Burn.deploy(
       args[0], args[1], args[2], args[3], arg[4], arg[5]
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
  