<template>
  <div>
    <NuxtWelcome />
  </div>
</template>
<script setup lang="ts">

import { connectWallet, fetchWalletBalances } from './swapkit';
onMounted(() => {
  connectWallet();
  fetchWalletBalances();
});

</script>