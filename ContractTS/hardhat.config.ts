import { HardhatUserConfig } from "hardhat/config"
import "dotenv/config"
// import "solidity-coverage"
// import "@typechain/hardhat"
import "@nomicfoundation/hardhat-toolbox";

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
const MUMBAI_RPC_URL =
  process.env.MUMBAI_RPC_URL ||
  "https://polygon-mumbai.g.alchemy.com/v2/your-api-key"
const PRIVATE_KEY =
  process.env.PRIVATE_KEY ||
  ""
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || ""

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001
    },
  },
  solidity: "0.8.12",
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY,
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