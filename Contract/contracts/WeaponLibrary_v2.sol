// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


library WeaponLibrary_v2 {

    using Strings for uint16;

    enum WeaponType { EMPTY, SWORD, WARAXE, SPEAR, WARHAMMER}

    struct OffensiveStats {
        uint16 sharpDamage;
        uint16 bluntDamage;
        uint16 burnDamage;
        uint16 pierce;
        uint16 lethality;
    }

    struct DefensiveStats {
        uint16 sharpResistance;
        uint16 bluntResistance;
        uint16 burnResistance;
        uint16 guard;
    }

    struct WeaponStats {
        uint16 health;
        uint16 speed;
        uint16 mind;
        OffensiveStats offensiveStats;
        DefensiveStats defensiveStats;
        uint16 handling;
    }

    // ["Sword", "description", "image", 1, 1, [1, 1, 1, [1, 1, 1, 1, 1], [1, 1, 1, 1], 1], ["spell1", "spell2", "spell3", "spell4"], 0, 1]
    struct Weapon {
        string name;
        string description;
        string image;
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
                '"image": "', _weapon.image, '", ',
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

    function createAttributes(Weapon memory _weapon) private pure returns (string memory) {
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

    function formatStats(Weapon memory _weapon) private pure returns (string memory) {
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
                '"trait_type" : "Mind", ',
                '"value" : "', _weapon.weaponStats.mind.toString(), '"',
            '}, ',
            formatOffensiveStats(_weapon),
            formatDefensiveStats(_weapon),
            '{', 
                '"trait_type" : "Handling", ',
                '"value" : "', _weapon.weaponStats.handling.toString(), '"',
            '}, '
        ));
    }

    function formatOffensiveStats(Weapon memory _weapon) private pure returns (string memory) {
        return string(abi.encodePacked(
            '{', 
                '"trait_type" : "Sharp Damage", ',
                '"value" : "', _weapon.weaponStats.offensiveStats.sharpDamage.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Blunt Damage", ',
                '"value" : "', _weapon.weaponStats.offensiveStats.bluntDamage.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Burn Damage", ',
                '"value" : "', _weapon.weaponStats.offensiveStats.burnDamage.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Pierce", ',
                '"value" : "', _weapon.weaponStats.offensiveStats.pierce.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Lethality", ',
                '"value" : "', _weapon.weaponStats.offensiveStats.lethality.toString(), '"',
            '}, '
        ));
    }

    function formatDefensiveStats(Weapon memory _weapon) private pure returns (string memory) {
        return string(abi.encodePacked(
            '{', 
                '"trait_type" : "Sharp Resistance", ',
                '"value" : "', _weapon.weaponStats.defensiveStats.sharpResistance.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Blunt Resistance", ',
                '"value" : "', _weapon.weaponStats.defensiveStats.bluntResistance.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Burn Resistance", ',
                '"value" : "', _weapon.weaponStats.defensiveStats.burnResistance.toString(), '"',
            '}, ',
            '{', 
                '"trait_type" : "Guard", ',
                '"value" : "', _weapon.weaponStats.defensiveStats.guard.toString(), '"',
            '}, '
        ));
    }


    function formatSpells(Weapon memory _weapon) private pure returns (string memory) {
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

    function formatWeaponType(WeaponType _weaponType) private pure returns (string memory) {
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

    function gainXP(Weapon storage _weapon, uint16 _xp) external {
        _weapon.xp += _xp;
    }
    
    // how many xp do we need to lvl up ? -> 1
    function levelUp(Weapon storage _weapon, WeaponStats memory _upgradeStats) external  {
        require(_weapon.xp >= 1);
        _weapon.weaponStats.health += _upgradeStats.health;
        _weapon.weaponStats.speed += _upgradeStats.speed;
        _weapon.weaponStats.mind += _upgradeStats.mind;
        _weapon.weaponStats.offensiveStats.sharpDamage += _upgradeStats.offensiveStats.sharpDamage;
        _weapon.weaponStats.offensiveStats.bluntDamage += _upgradeStats.offensiveStats.bluntDamage;
        _weapon.weaponStats.offensiveStats.burnDamage += _upgradeStats.offensiveStats.burnDamage;
        _weapon.weaponStats.offensiveStats.pierce += _upgradeStats.offensiveStats.pierce;
        _weapon.weaponStats.offensiveStats.lethality += _upgradeStats.offensiveStats.lethality;
        _weapon.weaponStats.defensiveStats.sharpResistance += _upgradeStats.defensiveStats.sharpResistance;
        _weapon.weaponStats.defensiveStats.bluntResistance += _upgradeStats.defensiveStats.bluntResistance;
        _weapon.weaponStats.defensiveStats.burnResistance += _upgradeStats.defensiveStats.burnResistance;
        _weapon.weaponStats.defensiveStats.guard += _upgradeStats.defensiveStats.guard;
        _weapon.weaponStats.handling += _upgradeStats.handling;
        _weapon.level++;
        _weapon.xp -= 1;
        // upgrade here
    }

    // no protection from spamming and no protection from upgrade by other than owner
    // what is the requirement for the xp ? -> 1 for the moment
    function upgradeWeapon(Weapon storage _weapon, string memory newImage) external {
        require(_weapon.level > 1 * _weapon.stage);
        _weapon.stage++;
        if (bytes(newImage).length > 0)
            _weapon.image = newImage;
    }
}