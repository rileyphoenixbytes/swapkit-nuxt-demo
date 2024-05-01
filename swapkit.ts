
import * as SwapKitSDK from "@swapkit/sdk";
import { Chain } from "@swapkit/sdk";

const client = SwapKitSDK.createSwapKit({ config: {
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
  // utxoApiKey: process.env.UTXO_API_KEY,
}});
const connectChains = [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain];

export const connectWallet = () => {
  // @ts-expect-error TODO @swapkit/sdk typing issue
  return client.connectXDEFI(connectChains);
};

export const fetchWalletBalances = async () => {
  const wallets = await Promise.all(
    connectChains.map((chain) => client.getWalletWithBalance(chain))
  );

  console.log(wallets);
  // [{ balance: AssetAmount[]; address: string; walletType: WalletOption }]
};