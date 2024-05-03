import { AssetValue, Chain, createSwapKit, SwapKitApi } from "@swapkit/sdk";

let sdkClient: ReturnType<typeof createSwapKit>;

export const getSwapKitClient = async () => {
  if (sdkClient) return sdkClient;

  const core = createSwapKit({ config: { ethplorerApiKey: "freekey" } });

  sdkClient = core;

  return sdkClient;
};

const connectChains = [Chain.Ethereum, Chain.THORChain];

export const connectWallet = async () => {
  await AssetValue.loadStaticAssets();
  await getSwapKitClient();
  console.log(sdkClient);
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
