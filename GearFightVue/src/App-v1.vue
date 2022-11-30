<template>
  <div>
    <!-- connect-wallet button is visible if the wallet is not connected -->
  <button v-if="!connected" @click="connect">Connect wallet</button>
    <!-- call-contract button is visible if the wallet is connected -->
  <button v-if="connected" @click="callContract">Call contract</button>
  <button v-if="connected" @click="logContract">Log contract</button>
  {{ contractResult }}
  </div>
</template>

<script>
import Web3 from 'web3';
import compiledContract from './abi/GearFactory_v2.json'


export default {
  name: 'App',

  data() {
    return {
      connected: false,
      contractResult: '',
    }
  },
  methods: {
    connect() {
        // this connects to the wallet
      if (window.ethereum) { // first we check if metamask is installed
        window.ethereum.request({ method: 'eth_requestAccounts' })
          .then(() => {
            this.connected = true; // If users successfully connected their wallet
          });
      }
    },
    async callContract() {
      // // method for calling the contract method
      let web3 = new Web3(window.ethereum);
      let contractAddress = '0x1D79e57B1EA8DBc37bA5ECe6DFE9E83c261E2d7b';

      const contractABI = JSON.parse(`[{"anonymous": false,"inputs": [{  "indexed": false,  "internalType": "string",  "name": "gearId",  "type": "string"},{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "indexed": false,  "internalType": "struct GearFactory_v2.Stats",  "name": "createdGear",  "type": "tuple"}],"name": "NewGearCreated","type": "event"},{"anonymous": false,"inputs": [{  "indexed": true,  "internalType": "address",  "name": "previousOwner",  "type": "address"},{  "indexed": true,  "internalType": "address",  "name": "newOwner",  "type": "address"}],"name": "OwnershipTransferred","type": "event"},{"anonymous": false,"inputs": [{  "indexed": false,  "internalType": "string",  "name": "contractAddress",  "type": "string"},{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "indexed": false,  "internalType": "struct GearFactory_v2.Stats",  "name": "stats",  "type": "tuple"}],"name": "StatsForNft","type": "event"},{"inputs": [{  "components": [    {      "internalType": "address",      "name": "contractAddress",      "type": "address"    },    {      "internalType": "uint256",      "name": "tokenId",      "type": "uint256"    }  ],  "internalType": "struct GearFactory_v2.NftInfo",  "name": "_nftInfo",  "type": "tuple"},{  "internalType": "string",  "name": "_name",  "type": "string"}],"name": "createGear","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{  "internalType": "string",  "name": "",  "type": "string"}],"name": "gears","outputs": [{  "internalType": "uint16",  "name": "hp",  "type": "uint16"},{  "internalType": "uint16",  "name": "damage",  "type": "uint16"},{  "internalType": "uint16",  "name": "speed",  "type": "uint16"},{  "internalType": "uint16",  "name": "lvl",  "type": "uint16"},{  "internalType": "string",  "name": "id",  "type": "string"},{  "internalType": "string",  "name": "name",  "type": "string"},{  "internalType": "string",  "name": "description",  "type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{  "internalType": "string",  "name": "id",  "type": "string"}],"name": "getGear","outputs": [{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "internalType": "struct GearFactory_v2.Stats",  "name": "",  "type": "tuple"}],"stateMutability": "view","type": "function"},{"inputs": [{  "internalType": "address",  "name": "_contractAdd",  "type": "address"}],"name": "getStatsForNft","outputs": [{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "internalType": "struct GearFactory_v2.Stats",  "name": "",  "type": "tuple"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "owner","outputs": [{  "internalType": "address",  "name": "",  "type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "renounceOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{  "internalType": "address",  "name": "_contractAdd",  "type": "address"},{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "internalType": "struct GearFactory_v2.Stats",  "name": "_stats",  "type": "tuple"}],"name": "setStatsForNft","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{  "internalType": "address",  "name": "newOwner",  "type": "address"}],"name": "transferOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"}]`);
      let contract = new web3.eth.Contract(contractABI, contractAddress, {from: '0x0863A707DBfdCeC01Ee55A92AA77c38d9f3645E5'});
      contract.defaultChain = 'goerli';
      const myContract = '0xfa3737f6bce5c27e88359c5a44dae7f844b1814d';
      let obj = new Object();
      obj.damage = 1;
      obj.description = "Description.";
      obj.hp = 1;
      obj.id = "id";
      obj.lvl = 1;
      obj.name = "test";
      obj.speed = 1;
      await contract.methods.setStatsForNft(myContract, obj).send();
      let obj2 = new Object();
      obj2.contractAddress = myContract;
      obj2.tokenId = 1;
      await contract.methods.createGear(obj2, "The First One.").send();
      console.log("hehe: ", await contract.methods.getGear("fa3737f6bce5c27e88359c5a44dae7f844b1814d 1").call());

      // window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();
      
      // const contractABI = JSON.parse(`[{"anonymous": false,"inputs": [{  "indexed": false,  "internalType": "string",  "name": "gearId",  "type": "string"},{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "indexed": false,  "internalType": "struct GearFactory_v2.Stats",  "name": "createdGear",  "type": "tuple"}],"name": "NewGearCreated","type": "event"},{"anonymous": false,"inputs": [{  "indexed": true,  "internalType": "address",  "name": "previousOwner",  "type": "address"},{  "indexed": true,  "internalType": "address",  "name": "newOwner",  "type": "address"}],"name": "OwnershipTransferred","type": "event"},{"anonymous": false,"inputs": [{  "indexed": false,  "internalType": "string",  "name": "contractAddress",  "type": "string"},{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "indexed": false,  "internalType": "struct GearFactory_v2.Stats",  "name": "stats",  "type": "tuple"}],"name": "StatsForNft","type": "event"},{"inputs": [{  "components": [    {      "internalType": "address",      "name": "contractAddress",      "type": "address"    },    {      "internalType": "uint256",      "name": "tokenId",      "type": "uint256"    }  ],  "internalType": "struct GearFactory_v2.NftInfo",  "name": "_nftInfo",  "type": "tuple"},{  "internalType": "string",  "name": "_name",  "type": "string"}],"name": "createGear","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{  "internalType": "string",  "name": "",  "type": "string"}],"name": "gears","outputs": [{  "internalType": "uint16",  "name": "hp",  "type": "uint16"},{  "internalType": "uint16",  "name": "damage",  "type": "uint16"},{  "internalType": "uint16",  "name": "speed",  "type": "uint16"},{  "internalType": "uint16",  "name": "lvl",  "type": "uint16"},{  "internalType": "string",  "name": "id",  "type": "string"},{  "internalType": "string",  "name": "name",  "type": "string"},{  "internalType": "string",  "name": "description",  "type": "string"}],"stateMutability": "view","type": "function"},{"inputs": [{  "internalType": "string",  "name": "id",  "type": "string"}],"name": "getGear","outputs": [{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "internalType": "struct GearFactory_v2.Stats",  "name": "",  "type": "tuple"}],"stateMutability": "view","type": "function"},{"inputs": [{  "internalType": "address",  "name": "_contractAdd",  "type": "address"}],"name": "getStatsForNft","outputs": [{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "internalType": "struct GearFactory_v2.Stats",  "name": "",  "type": "tuple"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "owner","outputs": [{  "internalType": "address",  "name": "",  "type": "address"}],"stateMutability": "view","type": "function"},{"inputs": [],"name": "renounceOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{  "internalType": "address",  "name": "_contractAdd",  "type": "address"},{  "components": [    {      "internalType": "uint16",      "name": "hp",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "damage",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "speed",      "type": "uint16"    },    {      "internalType": "uint16",      "name": "lvl",      "type": "uint16"    },    {      "internalType": "string",      "name": "id",      "type": "string"    },    {      "internalType": "string",      "name": "name",      "type": "string"    },    {      "internalType": "string",      "name": "description",      "type": "string"    }  ],  "internalType": "struct GearFactory_v2.Stats",  "name": "_stats",  "type": "tuple"}],"name": "setStatsForNft","outputs": [],"stateMutability": "nonpayable","type": "function"},{"inputs": [{  "internalType": "address",  "name": "newOwner",  "type": "address"}],"name": "transferOwnership","outputs": [],"stateMutability": "nonpayable","type": "function"}]`);
      // const contractAddress = "0x1D79e57B1EA8DBc37bA5ECe6DFE9E83c261E2d7b";
      // window.contract = await new web3.eth.Contract(contractABI, contractAddress);//loadContract();

      // //set up your Ethereum transaction
      // const transactionParameters = {
      //     to: contractAddress, // Required except during contract publications.
      //     from: window.ethereum.selectedAddress, // must match user's active address.
      //     'data': window.contract.methods.setStatsForNft(myContract, obj).encodeABI() //make call to NFT smart contract 
      // };
      // try {
      //   const txHash = await window.ethereum
      //     .request({
      //         method: 'eth_sendTransaction',
      //         params: [transactionParameters],
      //     });
      //   console.log("WOOOW: https://goerli.etherscan.io/tx/", txHash);
      // } catch (error) {
      //   console.log("transaction failed");
      // }
    },
    async logContract() {
      let web3 = new Web3(window.ethereum);
      let contractAddress = '0x1D79e57B1EA8DBc37bA5ECe6DFE9E83c261E2d7b';
      const contractABI = compiledContract.abi;
      let contract = new web3.eth.Contract(contractABI, contractAddress, {from: web3.currentProvider.selectedAddress});
      contract.defaultChain = 'goerli';
      console.log("hehe: ", await contract.methods.getGear("fa3737f6bce5c27e88359c5a44dae7f844b1814d 1").call());
    },
  }
}
</script>