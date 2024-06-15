import { HardhatUserConfig } from "hardhat/config"
import "dotenv/config"
// import "solidity-coverage"
// import "@typechain/hardhat"
import "@nomicfoundation/hardhat-toolbox";

const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  "";

// AMOY
const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL ||
  "https://polygon-amoy.g.alchemy.com/v2/your-api-key";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

// Etherlink Testnet
const ETHERLINK_TESTNET_RPC_URL =
  process.env.ETHERLINK_TESTNET_RPC_URL ||
  "https://node.ghostnet.etherlink.com";
const ETHERLINK_API_KEY = process.env.ETHERLINK_API_KEY || "";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    polygonAmoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002
    },
    etherlinkTestnet: {
      chainId: 128123,
      url: ETHERLINK_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: "0.8.12",
  etherscan: {
    apiKey: {
      polygonAmoy: POLYGONSCAN_API_KEY,
      etherlinkTestnet: ETHERLINK_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        },
      },
      {
        network: "etherlinkTestnet",
        chainId: 128123,
        urls: {
          apiURL: "https://testnet-explorer.etherlink.com/api",
          browserURL: "https://testnet-explorer.etherlink.com"
        }
      }
    ]
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
  },
}

export default config