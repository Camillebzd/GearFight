const { expect } = require('chai');
const { loadFixture } = waffle;

// remix arg for weapon : ["Sword", "description", "https://gateway.pinata.cloud/ipfs/QmZCvC7CymLx5AZoHCNfH1HBAUULe9bZdWxEGZjT5riY95", 1, 1, [10, 1, 2, 1, 1, 1, 1, 1, 1, 1], ["Spell1", "Spell2", "Spell3", "Spell4"], 0, 1]
// remix arg for state : [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

describe('GearFactory_v6', function () {
    async function deployFixture() {
        const WeaponLibrary = await ethers.getContractFactory("WeaponLibrary");
        const weaponLibrary = await WeaponLibrary.deploy();
        const GearFactory_v5 = await ethers.getContractFactory("GearFactory_v6", {
            libraries: {
                WeaponLibrary: weaponLibrary.address,
            }
        });
        const gearFactory = await GearFactory_v5.deploy();
        const basicSword = {
            name: "Basic Sword",
            description: "Little sword, perfect to train.",
            imageURI: "https://gateway.pinata.cloud/ipfs/QmZCvC7CymLx5AZoHCNfH1HBAUULe9bZdWxEGZjT5riY95",
            level: 1,
            stage: 1,
            weaponStats: {
                health: 81,
                speed: 22,
                sharpDmg: 23,
                bluntDmg: 6,
                sharpRes: 14,
                bluntRes: 2,
                penRes: 4,
                handling: 20,
                guard: 22,
                lethality: 15
            },
            spells: ["Spell1", "Spell2", "Spell3", "Spell4"],
            xp: 0,
            weaponType: 1 // SWORD
        };
        const lvlUpStats = {
            health: 2,
            speed: 2,
            sharpDmg: 2,
            bluntDmg: 1,
            sharpRes: 1,
            bluntRes: 0,
            penRes: 0,
            handling: 2,
            guard: 2,
            lethality: 2
        }
        const stage2SwordImg = "https://gateway.pinata.cloud/ipfs/QmXBNSUSCUpUEXJzJxU1TXbsdojacrM9sptuhbsHTz8nsR";
    
        return { gearFactory, basicSword, lvlUpStats, stage2SwordImg };
    }

    it("Should create an uri with valid JSON", async function() {
        const { gearFactory, basicSword } = await loadFixture(deployFixture);

        await gearFactory.requestWeapon(basicSword);
        let weaponURI = await gearFactory.uri(0);
        expect(weaponURI.length).to.be.above(0);
        let swordObj = JSON.parse(atob(weaponURI.substring(29)));
        expect(swordObj.name).to.equal("Basic Sword");
        expect(swordObj.attributes[2].value).to.equal('81');
    });

    it("Should request weapon", async function () {
        const { gearFactory, basicSword } = await loadFixture(deployFixture);
        
        await gearFactory.requestWeapon(basicSword);
        let weaponURI = await gearFactory.uri(0);
        expect(weaponURI.length).to.be.above(0);
        // request only one weapon
        expect(gearFactory.requestWeapon(basicSword)).to.be.revertedWith("");
        // change the request amount
        await gearFactory.setWeaponsRequest(2);
        expect(gearFactory.requestWeapon(basicSword)).not.to.be.revertedWith("");
    });

    it("Should gain xp, levelup and upgrade", async function() {
        const { gearFactory, basicSword, lvlUpStats, stage2SwordImg } = await loadFixture(deployFixture);
        
        await gearFactory.requestWeapon(basicSword);
        await gearFactory.gainXP(0, 1);
        await gearFactory.levelUp(0, lvlUpStats);
        let weapon = await gearFactory.weapons(0);
        expect(weapon.level).to.equal(2);
        expect(weapon.xp).to.equal(0);
        expect(weapon.imageURI).to.equal(basicSword.imageURI);
        await gearFactory.upgradeWeapon(0, stage2SwordImg);
        weapon = await gearFactory.weapons(0);
        expect(weapon.imageURI).to.equal(stage2SwordImg);
        expect(weapon.stage).to.equal(2);
    });

});