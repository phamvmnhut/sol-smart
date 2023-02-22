import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + "/.env" });

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    bsctest: {
      accounts: [process.env.PRIV_KEY_BSCTEST || ""],
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
    },
  //   solanartest: {
  //     url: "https://api.testnet.solana.com",
  //     accounts: [process.env.PRIV_KEY || ""],
  //     gasPrice: 10000000000,
  //     blockGasLimit: 10000000
  //   },
  //   polygontest: {
  //     url: "https://rpc-mumbai.maticvigil.com",
  //     accounts: [process.env.PRIV_KEY || ""],
  //     gasPrice: 10000000000,
  //     blockGasLimit: 10000000
  //   },
  //   stctest: {
  //     url: "https://rpc.test.btcs.network",
  //     accounts: [process.env.PRIV_KEY || ""],
  //     gasPrice: 10000000000,
  //     blockGasLimit: 1000000,
  //     chainId:1115
  //   },
  //   main: {
  //     url: "https://bsc-dataseed1.binance.org",
  //     accounts: [process.env.PRIV_KEY || ""],
  //     gasPrice: 5100000000,
  //     blockGasLimit: 1000000
  //   }
  },

  etherscan: {
    apiKey: process.env.API_KEY_ETHERSCAN
  },
  gasReporter: {
    enabled: (process.env.REPORT_GAS) ? true : false
  }
};

export default config;
