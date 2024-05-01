import { ChainflipPlugin } from "@swapkit/chainflip";
import {
  AssetValue,
  SwapKitApi,
  type ConnectWalletParams,
} from "@swapkit/core";
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

const connectChains = [Chain.Ethereum, Chain.Bitcoin, Chain.THORChain];

export const connectWallet = async () => {
  await AssetValue.loadStaticAssets();
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

export const transfer = (params: {
  assetValue: AssetValue;
  recipient: string;
}) => {
  const walletInstance = sdkClient.getWallet(params.assetValue.chain);
  return walletInstance.transfer({ ...params, from: walletInstance.address });
};

export const swap = async () => {
  const senderAddress = sdkClient.getWallet(Chain.Ethereum).address;
  const recipientAddress = sdkClient.getWallet(Chain.THORChain).address;
  const { routes } = await SwapKitApi.getSwapQuote({
    sellAsset: "ETH.ETH",
    sellAmount: "0.01",
    buyAsset: "THOR.RUNE",
    senderAddress,
    recipientAddress,
    slippage: "3",
  });
  console.log(routes);

  return sdkClient.swap({
    pluginName: "thorchain",
    recipient: recipientAddress,
    route: routes[0],
  });
};
