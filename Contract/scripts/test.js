// scripts/index.js
async function main () {
    // Our code will go here
    const address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // change after deployement
    const GF = await ethers.getContractFactory('GearFactory_v2');
    const gearF = await GF.attach(address);
    const myContract = '0xfa3737f6bce5c27e88359c5a44dae7f844b1814d';
    let obj = new Object();
    obj.damage = 1;
    obj.description = "Description.";
    obj.hp = 1;
    obj.id = "id";
    obj.lvl = 1;
    obj.name = "test";
    obj.speed = 1;
    await gearF.setStatsForNft(myContract, obj);
    let obj2 = new Object();
    obj2.contractAddress = myContract;
    obj2.tokenId = 1;
    await gearF.createGear(obj2, "The First One.");
    console.log("hehe: ", await gearF.getGear("fa3737f6bce5c27e88359c5a44dae7f844b1814d 1"));
}

main()
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});