// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GearFactory_v3 is ERC721URIStorage, Ownable  {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Gear {
        string name;
        string description;
        string imageSVG;
        uint256 level;
        uint256 speed;
        uint256 strenght;
        uint256 life;
    }
    mapping(uint256 => Gear) public tokenIdToGear;

    constructor() ERC721 ("Gear Fight Test 3", "GFT3"){
    }

    // cost too much on big svg
    function generateGear(string memory _imgSVG) public pure returns(string memory){ 
        bytes memory svg = abi.encodePacked(_imgSVG);

        return string(
            abi.encodePacked(
                "data:image/svg+xml;base64,",
                Base64.encode(svg)
            )
        );
    }

    function getName(uint256 tokenId) public view returns (string memory) {
        return tokenIdToGear[tokenId].name;
    }

    function getDescription(uint256 tokenId) public view returns (string memory) {
        return tokenIdToGear[tokenId].description;
    }

    function getLevel(uint256 tokenId) public view returns (string memory) {
        return tokenIdToGear[tokenId].level.toString();
    }

    function getSpeed(uint256 tokenId) public view returns (string memory) {
        return tokenIdToGear[tokenId].speed.toString();
    }

    function getStrength(uint256 tokenId) public view returns (string memory) {
        return tokenIdToGear[tokenId].strenght.toString();
    }

    function getLife(uint256 tokenId) public view returns (string memory) {
        return tokenIdToGear[tokenId].life.toString();
    }

    function getTokenURI(uint256 tokenId) public view returns (string memory){
        bytes memory dataURI = abi.encodePacked(
            '{',
                '"name": "', getName(tokenId), '",',
                '"description": "', getDescription(tokenId), '",',
                '"image": "', generateGear(tokenIdToGear[tokenId].imageSVG), '",',
                '"attributes": [',
                    '{', 
                        '"trait_type" : "Level",',
                        '"value" : "', getLevel(tokenId), '"',
                    '},',
                    '{', 
                        '"trait_type" : "Speed",',
                        '"value" : "', getSpeed(tokenId), '"',
                    '},',
                    '{', 
                        '"trait_type" : "Strength",',
                        '"value" : "', getStrength(tokenId), '"',
                    '},',
                    '{', 
                        '"trait_type" : "Life",',
                        '"value" : "', getLife(tokenId), '"',
                    '}',
                ']',
            '}'
        );
        return string(
            abi.encodePacked(
                "data:application/json;base64,",
                Base64.encode(dataURI)
            )
        );
    }

    function mint(Gear memory _newGear) public onlyOwner {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        tokenIdToGear[newItemId].name = _newGear.name;
        tokenIdToGear[newItemId].description = _newGear.description;
        tokenIdToGear[newItemId].imageSVG = _newGear.imageSVG;
        tokenIdToGear[newItemId].level = _newGear.level;
        tokenIdToGear[newItemId].speed = _newGear.speed;
        tokenIdToGear[newItemId].strenght = _newGear.strenght;
        tokenIdToGear[newItemId].life = _newGear.life;
        _setTokenURI(newItemId, getTokenURI(newItemId));
    }

    function random(uint number) public view returns(uint){
        return uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % number;
    }

    function train(uint256 tokenId) public {
        require(_exists(tokenId), "Please use an existing token.");
        require(ownerOf(tokenId) == msg.sender, "You must own this token to train it.");
        tokenIdToGear[tokenId].level++;
        tokenIdToGear[tokenId].speed += 5;
        tokenIdToGear[tokenId].strenght += 5;
        tokenIdToGear[tokenId].life += 5;
        _setTokenURI(tokenId, getTokenURI(tokenId));
    }
}