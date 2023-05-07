// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./WeaponLibrary.sol";

contract GearFactory_v5 is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => WeaponLibrary.Weapon) public weapons;
    mapping(address => uint256) public weaponsRequested;
    uint256 public maxWeaponsRequest;
    address public ownerOfCurrencies;

    constructor() ERC1155("") {
        ownerOfCurrencies = msg.sender;
        maxWeaponsRequest = 1;
    }

    // check the weapon is not empty
    modifier notEmptyWeapon(WeaponLibrary.Weapon memory weapon) {
        require(bytes(weapon.name).length > 0);
        require(bytes(weapon.imageURI).length > 0);
        require(weapon.weaponType != WeaponLibrary.WeaponType.EMPTY);
        _;
    }

    function setWeaponsRequest(uint256 _maxWeaponsRequest) external onlyOwner {
        maxWeaponsRequest = _maxWeaponsRequest;
    }

    function mintWeapon(address to, uint256 amount, WeaponLibrary.Weapon memory newWeapon) public onlyOwner notEmptyWeapon(newWeapon) {
        _mint(to, _tokenIds.current(), amount, "");
        weapons[_tokenIds.current()] = newWeapon;
        _tokenIds.increment();
    }

    function requestWeapon(WeaponLibrary.Weapon memory newWeapon) external notEmptyWeapon(newWeapon) {
        require(weaponsRequested[msg.sender] < maxWeaponsRequest);
        mintWeapon(msg.sender, 1, newWeapon);
        weaponsRequested[msg.sender] += 1;
    }

    function uri(uint256 tokenId) public view override(ERC1155) notEmptyWeapon(weapons[tokenId]) returns (string memory) {
        return WeaponLibrary.createTokenURI(weapons[tokenId]);
    }

    // no protection from spamming and no protection for call by other than owner
    function gainXP(uint256 tokenId, uint16 _xp) external notEmptyWeapon(weapons[tokenId]) {
        weapons[tokenId].xp += _xp;
    }

    // no protection from spamming and no protection for call by other than owner
    // how many xp do we need to lvl up ? -> 1
    function levelUp(uint256 tokenId, WeaponLibrary.WeaponStats memory _upgradeStats) external notEmptyWeapon(weapons[tokenId]) {
        require(weapons[tokenId].xp >= 1);
        weapons[tokenId].weaponStats.health += _upgradeStats.health;
        weapons[tokenId].weaponStats.speed += _upgradeStats.speed;
        weapons[tokenId].weaponStats.sharpDmg += _upgradeStats.sharpDmg;
        weapons[tokenId].weaponStats.bluntDmg += _upgradeStats.bluntDmg;
        weapons[tokenId].weaponStats.sharpRes += _upgradeStats.sharpRes;
        weapons[tokenId].weaponStats.bluntRes += _upgradeStats.bluntRes;
        weapons[tokenId].weaponStats.penRes += _upgradeStats.penRes;
        weapons[tokenId].weaponStats.handling += _upgradeStats.handling;
        weapons[tokenId].weaponStats.guard += _upgradeStats.guard;
        weapons[tokenId].weaponStats.lethality += _upgradeStats.lethality;
        weapons[tokenId].level++;
        weapons[tokenId].xp -= 1;
    }

    // no protection from spamming and no protection from upgrade by other than owner
    // what is the requirement for the xp ? -> 1 for the moment
    function upgradeWeapon(uint256 tokenId, string memory newImageURI) external notEmptyWeapon(weapons[tokenId]) {
        require(weapons[tokenId].level > 1 * weapons[tokenId].stage);
        weapons[tokenId].stage++;
        if (bytes(newImageURI).length > 0)
            weapons[tokenId].imageURI = newImageURI;
        //add more stats ???
    }
}