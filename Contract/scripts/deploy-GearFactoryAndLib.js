async function main() {
    const WeaponLibrary = await ethers.getContractFactory("WeaponLibrary");
    const weaponLibrary = await WeaponLibrary.deploy(); // Instance of the Lib 
    const GearFactory_v6 = await ethers.getContractFactory("GearFactory_v6", {
        libraries: {
            WeaponLibrary: weaponLibrary.address,
        }
    });

    // Start deployment, returning a promise that resolves to a contract object
    const gearFactory_v6 = await GearFactory_v6.deploy(); // Instance of the contract 
    console.log("Contract deployed to address:", gearFactory_v6.address);
    console.log("Lib deployed to address:", weaponLibrary.address);
}
 
 main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });