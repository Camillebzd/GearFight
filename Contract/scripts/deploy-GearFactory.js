async function main() {
    // Grab the contract factory 
    const GearFactory_v2 = await ethers.getContractFactory("GearFactory_v2");

    // Start deployment, returning a promise that resolves to a contract object
    const gearFactory_v2 = await GearFactory_v2.deploy(); // Instance of the contract 
    console.log("Contract deployed to address:", gearFactory_v2.address);
}
 
 main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });