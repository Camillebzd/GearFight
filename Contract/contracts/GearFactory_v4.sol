// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GearFactory_v4 is ERC1155, Ownable {
    using Strings for uint16;

    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public id = 2;

    struct Currency {
        string name;
        string description;
        string imageURI;
    }

    enum WeaponType { EMPTY, SWORD, WARAXE, SPEAR, WARHAMMER}

    struct WeaponStats {
        uint16 health;
        uint16 speed;
        uint16 sharpDmg;
        uint16 bluntDmg;
        uint16 sharpRes;
        uint16 bluntRes;
        uint16 penRes;
        uint16 handling;
        uint16 guard;
        uint16 lethality;
    }

    struct Weapon {
        string name;
        string description;
        string imageURI;
        uint16 level;
        WeaponStats weaponStats;
        string[4] spells;
        uint16 xp;
        WeaponType weaponType;
    }

    // --------- sword data ---------
    // string[3] public swordImages = [
    //     "https://gateway.pinata.cloud/ipfs/QmZCvC7CymLx5AZoHCNfH1HBAUULe9bZdWxEGZjT5riY95",
    //     "https://gateway.pinata.cloud/ipfs/QmXBNSUSCUpUEXJzJxU1TXbsdojacrM9sptuhbsHTz8nsR",
    //     "https://gateway.pinata.cloud/ipfs/QmT6mreFGqVAenL8wBbG9B8L6c6sHesD7xZ4P7VzpX5Vnk"
    // ];

    mapping(uint256 => Currency) public currencies;
    mapping(uint256 => Weapon) public weapons;
    mapping(address => uint256) public weaponsRequested;
    uint256 public maxWeaponsRequest;
    address public ownerOfCurrencies;

    constructor() ERC1155("") {
        ownerOfCurrencies = msg.sender;
        _mint(msg.sender, GOLD, 10**6, "");
        _mint(msg.sender, SILVER, 10**6, "");
        currencies[GOLD] = Currency("Gold", "Rare currency use for big upgrades.", "goldImageURI");
        currencies[SILVER] = Currency("Silver", "Basic currency use for small upgrades.", "silverImageURI");
        maxWeaponsRequest = 1;
    }

    // check the weapon is not empty
    modifier notEmptyWeapon(Weapon memory weapon) {
        require(bytes(weapon.name).length > 0, "The weapon should have a name.");
        require(bytes(weapon.imageURI).length > 0, "The weapon should have an image URI.");
        require(weapon.weaponType != WeaponType.EMPTY, "The weapon should have a type");
        _;
    }

    function setWeaponsRequest(uint256 _maxWeaponsRequest) external onlyOwner {
        maxWeaponsRequest = _maxWeaponsRequest;
    }

    // remix arg : ["Sword", "description", "https://gateway.pinata.cloud/ipfs/QmZCvC7CymLx5AZoHCNfH1HBAUULe9bZdWxEGZjT5riY95", 1, [10, 1, 2, 1, 1, 1, 1, 1, 1, 1], ["Spell1", "Spell2", "Spell3", "Spell4"], 0, 1]
    function mintWeapon(address to, uint256 amount, Weapon memory newWeapon) public onlyOwner notEmptyWeapon(newWeapon) {
        _mint(to, id, amount, "");
        weapons[id] = newWeapon;
        id++;
    }

    function requestWeapon(Weapon memory newWeapon) external notEmptyWeapon(newWeapon) {
        require(weaponsRequested[msg.sender] < maxWeaponsRequest, "You already have requested all the weapons.");
        mintWeapon(msg.sender, 1, newWeapon);
        weaponsRequested[msg.sender] += 1;
    }

    function uri(uint256 tokenId) public view override(ERC1155) returns (string memory) {
        return createTokenURI(tokenId);
    }

    function createTokenURI(uint256 tokenId) public view returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', tokenId < 2 ? currencies[tokenId].name : weapons[tokenId].name, '", ',
                '"description": "', tokenId < 2 ? currencies[tokenId].description : weapons[tokenId].description, '", ',
                '"image": "', tokenId < 2 ? currencies[tokenId].imageURI : weapons[tokenId].imageURI, '", ',
                tokenId < 2 ? '' : createAttributes(tokenId),
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function createAttributes(uint256 tokenId) internal view returns (string memory) {
        return string(abi.encodePacked(
            '"attributes": [',
                '{', 
                    '"trait_type" : "Level",',
                    '"value" : "', weapons[tokenId].level.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Health", ',
                    '"value" : "', weapons[tokenId].weaponStats.health.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Speed", ',
                    '"value" : "', weapons[tokenId].weaponStats.speed.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Sharp Damage", ',
                    '"value" : "', weapons[tokenId].weaponStats.sharpDmg.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Blunt Damage", ',
                    '"value" : "', weapons[tokenId].weaponStats.bluntDmg.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Sharp Resistance", ',
                    '"value" : "', weapons[tokenId].weaponStats.sharpRes.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Blunt Resistance", ',
                    '"value" : "', weapons[tokenId].weaponStats.bluntRes.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Penetration Resistance", ',
                    '"value" : "', weapons[tokenId].weaponStats.penRes.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Handling", ',
                    '"value" : "', weapons[tokenId].weaponStats.handling.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Guard", ',
                    '"value" : "', weapons[tokenId].weaponStats.guard.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Lethality", ',
                    '"value" : "', weapons[tokenId].weaponStats.lethality.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Spells", ',
                    '"value" : ', formatSpells(tokenId),
                '}, ',
                // '{', 
                //     '"trait_type" : "Experience", ',
                //     '"value" : "', weapons[tokenId].xp.toString(), '"',
                // '}, ',
                // '{', 
                //     '"trait_type" : "Weapon Type", ',
                //     '"value" : "', formatWeaponType(weapons[tokenId].weaponType), '"',
                // '}',
            ']'
        ));
    }

    function formatSpells(uint256 tokenId) internal view returns (string memory) {
        string memory spellsFormated = '[';
        for (uint i = 0; i < weapons[tokenId].spells.length; i++) {
            spellsFormated = string.concat(spellsFormated, '"');
            spellsFormated = string.concat(spellsFormated, weapons[tokenId].spells[i]);
            spellsFormated = string.concat(spellsFormated, '"');
            if (i + 1 != weapons[tokenId].spells.length)
                spellsFormated = string.concat(spellsFormated, ', ');
        }
        return string.concat(spellsFormated, ']');
    }

    function formatWeaponType(WeaponType _weaponType) internal pure returns (string memory) {
        if (_weaponType == WeaponType.EMPTY)
            return "Empty";
        else if (_weaponType == WeaponType.SWORD)
            return "Sword";
        else if (_weaponType == WeaponType.WARAXE)
            return "Waraxe";
        else if (_weaponType == WeaponType.SPEAR)
            return "Spear";
        else if (_weaponType == WeaponType.WARHAMMER)
            return "Warhammer";
        else
            return "Empty";
    }

    // no protection from spamming and no protection from upgrade by other than owner
    function gainXP(uint256 tokenId, uint16 _xp, WeaponStats memory /*_upgradeStats*/) external notEmptyWeapon(weapons[tokenId]) {
        weapons[tokenId].xp += _xp;
    }

    // no protection from spamming and no protection from upgrade by other than owner
    // what is the requirement for the xp ?
    // function upgradeWeapon(uint256 tokenId) external notEmptyWeapon(weapons[tokenId]) {
    //     require(weapons[tokenId].xp > 10, "Not enough xp to upgrade.");

    // }

    // create multpiple fct upgrade for each weapon ?
    // pro -> lest storage data, cons not flexible
}