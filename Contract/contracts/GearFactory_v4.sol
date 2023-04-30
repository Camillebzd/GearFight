// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract GearFactory_v4 is ERC1155, Ownable {
    using Strings for uint256;

    uint256 public constant GOLD = 0;
    uint256 public constant SILVER = 1;
    uint256 public id = 2;

    struct Currency {
        string name;
        string description;
        string imageURI;
    }

    struct Weapon {
        string name;
        string description;
        string imageURI;
        uint256 level;
        uint256 life;
        uint256 speed;
        uint256 attack;
        uint256 attackSpe;
        uint256 defense;
        uint256 defenseSpe;
        string[] spells;
    }

    mapping(uint256 => Currency) public currencies;
    mapping(uint256 => Weapon) public weapons;
    mapping(address => uint256) public weaponsRequested;
    uint256 public maxWeaponsRequest;

    constructor() ERC1155("") {
        _mint(msg.sender, GOLD, 10**6, "");
        _mint(msg.sender, SILVER, 10**6, "");
        currencies[GOLD] = Currency("Gold", "Rare currency use for big upgrades.", "goldImageURI");
        currencies[SILVER] = Currency("Silver", "Basic currency use for small upgrades.", "silverImageURI");
        maxWeaponsRequest = 1;
    }

    function setWeaponsRequest(uint256 _maxWeaponsRequest) external onlyOwner {
        maxWeaponsRequest = _maxWeaponsRequest;
    }

    // remix arg : ["Sword", "Little sword.", "https://gateway.pinata.cloud/ipfs/QmNVM3iSFypcoB6etBKhTZt8nLDtDhiwjr9x2EkDtsna2N", 1, 10, 2, 2, 1, 2, 1, ["BasicSlash", "MediumSlash"]]
    function mintWeapon(address to, uint256 amount, Weapon memory newWeapon) public onlyOwner {
        _mint(to, id, amount, "");
        weapons[id] = newWeapon;
        id++;
    }

    function requestWeapon(Weapon memory newWeapon) external {
        require(weaponsRequested[msg.sender] < maxWeaponsRequest, "You already have requested all the weapons.");
        mintWeapon(msg.sender, 1, newWeapon);
        weaponsRequested[msg.sender] += 1;
    }

    function uri(uint256 tokenId) public view override(ERC1155) returns (string memory) {
        // add require for tokenId < id and protect or create uri anyway ?
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
                    '"trait_type" : "Life", ',
                    '"value" : "', weapons[tokenId].life.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Speed", ',
                    '"value" : "', weapons[tokenId].speed.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Attack", ',
                    '"value" : "', weapons[tokenId].attack.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "AttackSpe", ',
                    '"value" : "', weapons[tokenId].attackSpe.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Defense", ',
                    '"value" : "', weapons[tokenId].defense.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "DefenseSpe", ',
                    '"value" : "', weapons[tokenId].defenseSpe.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Spells", ',
                    '"value" : ', formatSPells(tokenId),
                '}',
            ']'
        ));
    }

    function formatSPells(uint256 tokenId) internal view returns (string memory) {
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
}