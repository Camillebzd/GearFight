// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// trusted Library
import "./WeaponLibrary_v2.sol";

contract GearFactory_v7 is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => WeaponLibrary_v2.Weapon) public weapons;
    mapping(address => uint256) public weaponsRequested;
    uint256 public maxWeaponsRequest;

    constructor() ERC1155("") {
        maxWeaponsRequest = 1;
    }

    // check the weapon is not empty
    modifier notEmptyWeapon(WeaponLibrary_v2.Weapon memory weapon) {
        require(weapon.weaponType != WeaponLibrary_v2.WeaponType.EMPTY);
        _;
    }

    function setWeaponsRequest(uint256 _maxWeaponsRequest) external onlyOwner {
        maxWeaponsRequest = _maxWeaponsRequest;
    }

    function mintWeapon(address to, uint256 amount, WeaponLibrary_v2.Weapon memory newWeapon) internal notEmptyWeapon(newWeapon) {
        _mint(to, _tokenIds.current(), amount, "");
        weapons[_tokenIds.current()] = newWeapon;
        _tokenIds.increment();
    }

    function requestWeapon(WeaponLibrary_v2.Weapon memory newWeapon) external notEmptyWeapon(newWeapon) {
        require(weaponsRequested[msg.sender] < maxWeaponsRequest);
        mintWeapon(msg.sender, 1, newWeapon);
        weaponsRequested[msg.sender] += 1;
    }

    function uri(uint256 tokenId) public view override(ERC1155) notEmptyWeapon(weapons[tokenId]) returns (string memory) {
        return WeaponLibrary_v2.createTokenURI(weapons[tokenId]);
    }

    // no protection from spamming and no protection for call by other than owner
    // -> put a rate limite example 3 blocks between each call...
    function gainXP(uint256 tokenId, uint16 _xp) external notEmptyWeapon(weapons[tokenId]) {
        WeaponLibrary_v2.gainXP(weapons[tokenId], _xp);
    }

    // no protection from spamming and no protection for call by other than owner
    function levelUp(uint256 tokenId, WeaponLibrary_v2.WeaponStats memory _upgradeStats) external notEmptyWeapon(weapons[tokenId]) {
        WeaponLibrary_v2.levelUp(weapons[tokenId], _upgradeStats);
    }

    function upgradeWeapon(uint256 tokenId, string memory newImage) external notEmptyWeapon(weapons[tokenId]) {
        WeaponLibrary_v2.upgradeWeapon(weapons[tokenId], newImage);
    }
}