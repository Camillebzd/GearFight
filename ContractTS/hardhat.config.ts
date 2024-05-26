import { HardhatUserConfig } from "hardhat/config"
import "dotenv/config"
// import "solidity-coverage"
// import "@typechain/hardhat"
import "@nomicfoundation/hardhat-toolbox";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const AMOY_RPC_URL =
  process.env.AMOY_RPC_URL ||
  "https://polygon-amoy.g.alchemy.com/v2/your-api-key"
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  ""
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || ""

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    polygonAmoy: {
      url: AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002
    },
  },
  solidity: "0.8.12",
  etherscan: {
    apiKey: {
      polygonAmoy: POLYGONSCAN_API_KEY,
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        },
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