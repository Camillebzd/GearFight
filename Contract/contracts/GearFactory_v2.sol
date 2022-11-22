// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "hardhat/console.sol";

contract GearFactory_v2 is Ownable {

    event NewGearCreated(string gearId, Stats createdGear);
    event StatsForNft(string contractAddress, Stats stats);

    struct Stats {
        uint16 hp;
        uint16 damage;
        uint16 speed;
        uint16 lvl;
        string id;
        string name;
        string description;
    }

    struct NftInfo {
        address contractAddress;
        uint tokenId;
    }

    mapping (address => Stats) private statsForNft;

    mapping (string => Stats) public gears;

    function getGear(string calldata id) public view returns(Stats memory) {
        return gears[id];
    }

    function getStatsForNft(address _contractAdd) public view returns(Stats memory) {
        return statsForNft[_contractAdd];
    }

    function createGear(NftInfo memory _nftInfo, string memory _name) public onlyOwner {
        require(statsForNft[_nftInfo.contractAddress].lvl != 0, "The contract address is unknown so no stats exist.");
        Stats memory newStats = statsForNft[_nftInfo.contractAddress];
        string memory gearId = _getGearIdFromNftInfo(_nftInfo);
        newStats.id = gearId;
        newStats.name = _name;
        gears[gearId] = newStats;
        console.log("gear created: %s with id: %s", gears[gearId].name, gears[gearId].id);
        emit NewGearCreated(gearId, newStats);
    }

    function _getGearIdFromNftInfo(NftInfo memory _nftInfo) private pure returns(string memory) {
        string memory addressContract = toAsciiString(_nftInfo.contractAddress);
        string memory tokenId = Strings.toString(_nftInfo.tokenId);
        string memory newId = string.concat(addressContract, " ");
        newId = string.concat(newId, tokenId);
        return newId;
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);            
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function setStatsForNft(address _contractAdd, Stats calldata _stats) external onlyOwner {
        statsForNft[_contractAdd] = _stats;
        string memory contractAddEmit = toAsciiString(_contractAdd);
        contractAddEmit = string.concat("0x", contractAddEmit);
        emit StatsForNft(contractAddEmit, _stats);
    }

}