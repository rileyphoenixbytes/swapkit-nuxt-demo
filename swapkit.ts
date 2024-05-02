import { AssetValue, SwapKitApi } from '@swapkit/core';
import { Chain, SwapKit } from '@swapkit/core';
import { MayachainPlugin, ThorchainPlugin } from '@swapkit/thorchain';
import { xdefiWallet } from '@swapkit/wallet-xdefi';

const wallets = {
  ...xdefiWallet,
} as const;

const plugins = {
  ...ThorchainPlugin,
  ...MayachainPlugin,
} as const;

type Client = ReturnType<typeof SwapKit<typeof plugins, typeof wallets>>;

let sdkClient: Client;

export const getSwapKitClient = () => {
  if (sdkClient) return sdkClient;

  const core = SwapKit({
    apis: {},
    rpcUrls: {},
    stagenet: false,
    config: { ethplorerApiKey: 'freekey' },
    wallets,
    plugins,
  });

  sdkClient = core;

  return sdkClient;
};

const connectChains = [
  Chain.Ethereum,
  Chain.Bitcoin,
  Chain.THORChain,
] satisfies Parameters<typeof sdkClient.connectXDEFI>[0];

export const connectWallet = async () => {
  await AssetValue.loadStaticAssets();
  return sdkClient.connectXDEFI(connectChains);
};

export const fetchWalletBalances = async () => {
  const wallets = (
    await Promise.allSettled(
      connectChains.map((chain) => sdkClient.getWalletWithBalance(chain)),
    )
  ).flatMap((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      console.error(
        `Failed to get ${connectChains[i]} chain wallet balance: ${result.reason}`,
      );
      return [];
    }
  });

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
    sellAsset: 'ETH.ETH',
    sellAmount: '0.01',
    buyAsset: 'THOR.RUNE',
    senderAddress,
    recipientAddress,
    slippage: '3',
  });
  console.log(routes);

  return sdkClient.swap({
    pluginName: 'thorchain',
    recipient: recipientAddress,
    route: routes[0],
  });
};
