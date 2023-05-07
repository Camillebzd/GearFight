// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


library WeaponLibrary {

    using Strings for uint16;

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
        uint16 stage;
        WeaponStats weaponStats;
        string[4] spells;
        uint16 xp;
        WeaponType weaponType;
    }

    function createTokenURI(Weapon memory _weapon) external pure returns (string memory) {
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', _weapon.name, '", ',
                '"description": "', _weapon.description, '", ',
                '"image": "', _weapon.imageURI, '", ',
                createAttributes(_weapon),
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function createAttributes(Weapon memory _weapon) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '"attributes": [',
                '{', 
                    '"trait_type" : "Level",',
                    '"value" : "', _weapon.level.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Stage",',
                    '"value" : "', _weapon.stage.toString(), '"',
                '}, ',
                formatStats(_weapon),
                '{', 
                    '"trait_type" : "Spells", ',
                    '"value" : ', formatSpells(_weapon),
                '}, ',
                '{', 
                    '"trait_type" : "Experience", ',
                    '"value" : "', _weapon.xp.toString(), '"',
                '}, ',
                '{', 
                    '"trait_type" : "Weapon Type", ',
                    '"value" : "', formatWeaponType(_weapon.weaponType), '"',
                '}',
            ']'
        ));
    }

    function formatStats(Weapon memory _weapon) internal pure returns (string memory) {
        return string(abi.encodePacked(
            '{', 
                '"trait_type" : "Health", ',
                '"value" : "', _weapon.weaponStats.health.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Speed", ',
                '"value" : "', _weapon.weaponStats.speed.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Sharp Damage", ',
                '"value" : "', _weapon.weaponStats.sharpDmg.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Blunt Damage", ',
                '"value" : "', _weapon.weaponStats.bluntDmg.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Sharp Resistance", ',
                '"value" : "', _weapon.weaponStats.sharpRes.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Blunt Resistance", ',
                '"value" : "', _weapon.weaponStats.bluntRes.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Penetration Resistance", ',
                '"value" : "', _weapon.weaponStats.penRes.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Handling", ',
                '"value" : "', _weapon.weaponStats.handling.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Guard", ',
                '"value" : "', _weapon.weaponStats.guard.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Lethality", ',
                '"value" : "', _weapon.weaponStats.lethality.toString(), '"',
            '}, '
        ));
    }

    function formatSpells(Weapon memory _weapon) internal pure returns (string memory) {
        string memory spellsFormated = '[';
        for (uint i = 0; i < _weapon.spells.length; i++) {
            spellsFormated = string.concat(spellsFormated, '"');
            spellsFormated = string.concat(spellsFormated, _weapon.spells[i]);
            spellsFormated = string.concat(spellsFormated, '"');
            if (i + 1 != _weapon.spells.length)
                spellsFormated = string.concat(spellsFormated, ', ');
        }
        return string.concat(spellsFormated, ']');
    }

    function formatWeaponType(WeaponType _weaponType) internal pure returns (string memory) {
        if (_weaponType == WeaponType.SWORD)
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
}