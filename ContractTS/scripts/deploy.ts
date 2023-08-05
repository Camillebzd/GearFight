import { ethers, run, network } from "hardhat"

async function main() {
  const GearFightFactory = await ethers.getContractFactory("GearFight");
  console.log("Deploying contract...");
  const gearFight = await GearFightFactory.deploy();
  await gearFight.deployed();

  // We only verify on a testnet!
  // if (network.config.chainId === 80001 && process.env.POLYGONSCAN_API_KEY) {
  //   // 6 blocks is sort of a guess
  //   await gearFight.deployTransaction.wait(6);
  //   await verify(gearFight.address, []);
  // }
  console.log("GearFight deployed to:", await gearFight.getAddress());
}

const verify = async (contractAddress: string, args: any[]) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already verified!");
    } else {
      console.log(e);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })