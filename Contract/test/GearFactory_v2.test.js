// test/Box.test.js
// Load dependencies
const { expect } = require('chai');

describe('GearFactory_v2', function () {
  before(async function () {
    this.GearFight = await ethers.getContractFactory('GearFactory_v2');
  });

  beforeEach(async function () {
    this.gf = await this.GearFight.deploy();
    await this.gf.deployed();
  });

  const myNftContract = '0xfa3737f6bce5c27e88359c5a44dae7f844b1814d';
  let statsTestObj = new Object();
  statsTestObj.damage = 1;
  statsTestObj.description = "Description.";
  statsTestObj.hp = 1;
  statsTestObj.id = "";
  statsTestObj.lvl = 1;
  statsTestObj.name = "test";
  statsTestObj.speed = 1;
  let nftInfo = new Object();
  nftInfo.contractAddress = myNftContract;
  nftInfo.tokenId = 1;

  it('set stats for a nft contract', async function () {
    await this.gf.setStatsForNft(myNftContract, statsTestObj);
    let info = await this.gf.getStatsForNft(myNftContract);

    expect(info.hp).to.equal(statsTestObj.hp);
    expect(info.damage).to.equal(statsTestObj.damage);
    expect(info.speed).to.equal(statsTestObj.speed);
    expect(info.lvl).to.equal(statsTestObj.lvl);
    expect(info.id).to.equal(statsTestObj.id);
    expect(info.name).to.equal(statsTestObj.name);
    expect(info.description).to.equal(statsTestObj.description);
  });

  it('set stats for a nft contract then create a gear', async function () {
    await this.gf.setStatsForNft(myNftContract, statsTestObj);
    let newName = "Best Test";
    await this.gf.createGear(nftInfo, newName);
    let gearId = myNftContract.substring(2) + " " + nftInfo.tokenId;
    let gearInfo = await this.gf.getGear(gearId);

    expect(gearInfo.hp).to.equal(statsTestObj.hp);
    expect(gearInfo.damage).to.equal(statsTestObj.damage);
    expect(gearInfo.speed).to.equal(statsTestObj.speed);
    expect(gearInfo.lvl).to.equal(statsTestObj.lvl);
    expect(gearInfo.id).to.equal(gearId);
    expect(gearInfo.name).to.equal(newName);
    expect(gearInfo.description).to.equal(statsTestObj.description);
  });
});