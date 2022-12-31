async function main() {
    // Grab the contract factory 
    const GearFactory_v3 = await ethers.getContractFactory("GearFactory_v3");

    // Start deployment, returning a promise that resolves to a contract object
    const gearFactory_v3 = await GearFactory_v3.deploy(); // Instance of the contract 
    console.log("Contract deployed to address:", gearFactory_v3.address);
}
 
 main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });