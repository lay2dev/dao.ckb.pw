<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="bg-grey-1">
      <router-view style="max-width: 600px;margin: 0 auto;" />
    </q-page-container>
  </q-layout>
</template>

<script>
  import PWCore, {
    EthProvider,
    PwCollector,
    CHAIN_SPECS,
    ChainID,
    CellDep,
  } from "@lay2/pw-core";
  export default {
    data() {
      return {};
    },
    async created() {
      this.$i18n.locale = this.$q.lang.getLocale();

      let devSpec = undefined,
        chainId = undefined;
      if (process.env.CKB_NODE === "https://lay2.ckb.dev") {
        devSpec = CHAIN_SPECS.Lay2;
        chainId = ChainID.ckb_dev;
      }

      const pwcore = await new PWCore(process.env.CKB_NODE).init(
        new EthProvider(),
        new PwCollector(process.env.BASE_URL),
        chainId,
        devSpec
      );

      this.$store.commit("pwcore/updateAddress", PWCore.provider.address);
      console.log("[init] address: ", PWCore.provider.address.addressString);
      if (!!window.imToken) {
        console.log("[init] imToken");
        imToken.callAPI("navigator.configure", {
          navigatorColor: "#51c68a",
        });
      }
    },
  };
</script>