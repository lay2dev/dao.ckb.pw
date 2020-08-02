<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />
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

      const devSpec = CHAIN_SPECS.Lay2;
      const pwcore = await new PWCore(process.env.CKB_NODE).init(
        new EthProvider(),
        new PwCollector(process.env.BASE_URL),
        ChainID.ckb_dev,
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