import { createSwapKit } from '@swapkit/sdk'

const swapKitClient = createSwapKit({
  config: {
    stagenet: false,
    /**
     * @required for AVAX & BSC
     */
    covalentApiKey: process.env.COVALENT_API_KEY,
    /**
     * @required for ETH
     */
    ethplorerApiKey: process.env.ETHPLORER_API_KEY,
    /**
     * @required for BTC, LTC, DOGE & BCH
     */
    utxoApiKey: process.env.UTXO_API_KEY,
  }
})

import {  Chain,  WalletOption } from '@swapkit/sdk'

const client = createSwapKit();
const connectChains = [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain]

export const connectWallet = () => {
      return client.connectXDEFI(connectChains);
  }

  
export const fetchWalletBalances =async  () => {
  const wallets = await Promise.all(connectChains.map(client.getWalletWithBalance));

  console.log(wallets)
  // [{ balance: AssetAmount[]; address: string; walletType: WalletOption }]
}