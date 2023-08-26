async function main() {
    const WeaponLibrary = await ethers.getContractFactory("WeaponLibrary_v2");
    const weaponLibrary = await WeaponLibrary.deploy(); // Instance of the Lib 
    const GearFactory_v7 = await ethers.getContractFactory("GearFactory_v7", {
        libraries: {
            WeaponLibrary_v2: weaponLibrary.address,
        }
    });

    // Start deployment, returning a promise that resolves to a contract object
    const gearFactory_v7 = await GearFactory_v7.deploy(); // Instance of the contract 
    console.log("Contract deployed to address:", gearFactory_v7.address);
    console.log("Lib deployed to address:", weaponLibrary.address);
}
 
 main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });