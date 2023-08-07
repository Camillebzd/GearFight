import { ethers, run, network } from "hardhat"

async function main() {
  const GearFactory = await ethers.getContractFactory("GearFactory");
  const gearFactory = await GearFactory.deploy();
  const libAddress = await gearFactory.getAddress();
  const GearFight = await ethers.getContractFactory("GearFight", {
      libraries: {
          GearFactory: libAddress,
      }
  });
  const gearFight = await GearFight.deploy();

  // We only verify on a testnet!
  if (network.config.chainId === 80001 && process.env.POLYGONSCAN_API_KEY) {
    await gearFight.deploymentTransaction()!.wait(6);
    await verify(await gearFactory.getAddress(), []);
    await verify(await gearFight.getAddress(), []);
  }
  console.log("GearFactory deployed to:", await gearFactory.getAddress());
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