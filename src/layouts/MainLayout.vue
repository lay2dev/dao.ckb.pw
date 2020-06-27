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
    CellDep
  } from "@lay2/pw-core";
  export default {
    data() {
      return {};
    },
    async created() {
      const devSpec = CHAIN_SPECS.Lay2;
      // devSpec.pwLock.cellDep.outPoint.txHash =
      //   "0xc7e98de5815a946fe2e4fd23296f93764c881878319a9cb25ef7c395478572e9";
      // devSpec.pwLock.script.codeHash =
      //   "0xafb2d68dd7bb1ae6b3298ffe42527997b5b8a99dc8204e0a499a2e7289f30527";

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
          navigatorColor: "#51c68a"
        });
      }
    }
  };
</script>