import { ChainflipPlugin } from "@swapkit/chainflip";
import type { ConnectWalletParams } from "@swapkit/core";
import { SwapKit, Chain } from "@swapkit/core";
import { MayachainPlugin, ThorchainPlugin } from "@swapkit/thorchain";
import { coinbaseWallet } from "@swapkit/wallet-coinbase";
import { evmWallet } from "@swapkit/wallet-evm-extensions";
import { keepkeyWallet } from "@swapkit/wallet-keepkey";
import { keplrWallet } from "@swapkit/wallet-keplr";
import { keystoreWallet } from "@swapkit/wallet-keystore";
import { ledgerWallet } from "@swapkit/wallet-ledger";
import { okxWallet } from "@swapkit/wallet-okx";
import { trezorWallet } from "@swapkit/wallet-trezor";
import { walletconnectWallet } from "@swapkit/wallet-wc";
import { xdefiWallet } from "@swapkit/wallet-xdefi";

const wallets = {
  ...xdefiWallet,
} as const;

const plugins = {
  ...ThorchainPlugin,
  ...MayachainPlugin,
} as const;

type Client = ReturnType<typeof SwapKit<typeof plugins, typeof wallets>>;

let sdkClient: Client;

export const getSwapKitClient = async () => {
  if (sdkClient) return sdkClient;

  const core = SwapKit({
    apis: {},
    rpcUrls: {},
    stagenet: false,
    config: { ethplorerApiKey: "freekey" },
    wallets,
    plugins,
  });

  sdkClient = core;

  return sdkClient;
};

// const client = SwapKitSDK.createSwapKit({
//   config: {
//     stagenet: false,
//     /**
//      * @required for AVAX & BSC
//      */
//     covalentApiKey: process.env.COVALENT_API_KEY,
//     /**
//      * @required for ETH
//      */
//     ethplorerApiKey: process.env.ETHPLORER_API_KEY,
//     /**
//      * @required for BTC, LTC, DOGE & BCH
//      */
//     // utxoApiKey: process.env.UTXO_API_KEY,
//   },
// });
const connectChains = [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain];

export const connectWallet = async () => {
  await getSwapKitClient();
  // @ts-expect-error
  return sdkClient.connectXDEFI(connectChains);
};

export const fetchWalletBalances = async () => {
  const wallets = await Promise.all(
    connectChains.map((chain) => sdkClient.getWalletWithBalance(chain))
  );

  console.log(wallets);
  // [{ balance: AssetAmount[]; address: string; walletType: WalletOption }]
};
