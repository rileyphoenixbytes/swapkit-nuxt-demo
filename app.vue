<template>
    <div>
        <NuxtWelcome />
    </div>
</template>
<script setup lang="ts">
import { onMounted } from "#imports";
import { transfer, connectWallet, swap, fetchWalletBalances } from "./swapkit";
onMounted(async () => {
    const { AssetValue } = await import("@swapkit/sdk");
    console.log(await connectWallet());

    // await fetchWalletBalances();
    // await transfer({
    //     recipient: "0x1234567890123456789012345678901234567890",
    //     assetValue: AssetValue.fromStringSync("ETH.ETH", 0.001),
    // });
    await swap();
});
</script>