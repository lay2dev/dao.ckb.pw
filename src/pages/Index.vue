<template>
  <q-page class="flex column main">
    <div class="column dashboard">
      <div class="col-4 row a">
        <q-item class="col">
          <q-item-section side>
            <q-avatar color="white" size="48px">
              <img src="~assets/dao.svg" style="height: 24px;" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>Nervos DAO</q-item-label>
            <q-item-label caption>{{$t('meta.label.slogan')}}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label class="text-yellow-6 text-subtitle2">{{apc.toFixed(2)}}%</q-item-label>
            <q-item-label caption class="row items-center">
              <q-icon name="ion-information-circle-outline" class="q-mr-xs" />
              {{$t('meta.label.apc')}}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
      <div class="col-8 row b q-px-md">
        <q-card bordered class="col column justify-center stat">
          <q-card-section horizontal>
            <q-card-section class="col column">
              <div class="text-grey text-caption">{{$t('meta.label.locked')}}</div>
              <div class="text-accent text-bold" style="font-size:1.2em">{{locked}}</div>
            </q-card-section>
            <q-separator vertical inset />
            <q-card-section class="column justify-around">
              <div class="row items-center q-gutter-xs">
                <div class="text-grey text-caption">{{$t('meta.label.yesterday')}}</div>
                <div class="text-accent meta-text">{{yesterday}}</div>
              </div>
              <div class="row items-center q-gutter-xs">
                <div class="text-grey text-caption">{{$t('meta.label.cum_yield')}}</div>
                <div class="text-accent meta-text">{{cumYield}}</div>
              </div>
            </q-card-section>
            <!-- <q-separator inset />
            <q-card-section class="column"></q-card-section>-->
          </q-card-section>
          <q-separator inset />
          <q-card-section horizontal class="items-center">
            <q-card-section class="column col">
              <div class="text-grey text-caption">{{$t('meta.label.balance')}}</div>
              <div class="text-accent">{{balance}}</div>
            </q-card-section>
            <q-card-section class="column">
              <q-btn
                color="indigo-4"
                outline
                rounded
                unelevated
                no-caps
                icon="img:statics/pw.svg"
                :label="$t('meta.btn.wallet')"
                @click="openUrl('https://ckb.pw')"
              />
            </q-card-section>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row deposit q-px-md q-mb-sm">
      <q-card flat class="bg-accent col column">
        <div class="col row justify-between items-end q-pa-md">
          <q-input
            dense
            dark
            standout
            clearable
            :error="validAmount !== true"
            clear-icon="close"
            hide-bottom-space
            class="col amount-input q-mr-md"
            suffix="CKB"
            v-model="amount"
          />
          <q-btn
            color="primary"
            :disable="validAmount!==true"
            rounded
            no-caps
            :label="$t('meta.btn.deposit')"
            @click="deposit"
          />
        </div>
      </q-card>
    </div>
    <div class="column q-px-md q-mb-sm">
      <div class="row justify-evenly filter-wrapper">
        <q-btn
          flat
          padding="10px"
          :ripple="false"
          class="col filter-button"
          :class="filter==='locked'? 'filter-active' : 'filter-inactive'"
          :label="$t('filter.locked')"
          @click="filter = 'locked'"
        />
        <q-btn
          flat
          padding="10px"
          :ripple="false"
          class="col filter-button"
          :class="filter==='unlocked'? 'filter-active' : 'filter-inactive'"
          :label="$t('filter.unlocked')"
          @click="filter = 'unlocked'"
        />
      </div>
    </div>
    <div v-if="banner.show" class="column q-px-md q-mb-sm">
      <q-banner dense inline-actions rounded :class="`${banner.type}-banner`">
        <div class="col row items-center">
          <div v-if="banner.loading">
            <q-spinner-bars class="q-mx-xs" size="xs" />
          </div>
          <div class="q-ma-xs">{{banner.message}}</div>
        </div>
        <template v-slot:action>
          <div class="q-px-xs">
            <q-btn
              v-if="banner.link"
              outline
              round
              dense
              size="xs"
              icon="ion-md-open"
              @click="openUrl(banner.link)"
            />
            <q-btn v-else outline round dense size="xs" icon="close" @click="banner.show=false" />
          </div>
        </template>
      </q-banner>
    </div>
    <q-list class="column col records justify-start q-px-md">
      <dao-item
        v-for="(cell, index) in cells"
        :cell="cell"
        :key="index"
        @withdraw="withdraw"
        class="q-mb-sm"
      />
    </q-list>
  </q-page>
</template>

<script>
  import DaoItem from "../components/DaoItem";
  import { DaoCell } from "../models";
  import API from "../services/api";
  import DepositBuilder from "../services/deposit-builder";
  import Withdraw1Builder from "../services/withdraw1-builder";
  import PWCore, { AmountUnit, Amount, EthSigner } from "@lay2/pw-core";
  import { mapGetters } from "vuex";
  import { openURL, QSpinnerBall, Notify } from "quasar";
  import Withdraw2Builder from "../services/withdraw2-builder";

  export default {
    name: "PageIndex",
    components: {
      DaoItem,
    },
    data() {
      return {
        apc: 0.0342,
        balanceAmount: Amount.ZERO,
        depositAmount: new Amount("1000"),
        lockedAmount: Amount.ZERO,
        yesterdayAmount: Amount.ZERO,
        curYieldAmount: Amount.ZERO,
        cumYieldAmount: Amount.ZERO,
        validAmount: true,

        filter: "locked",
        items: [],
        banner: {
          show: false,
          type: "positive",
          message: "test test test test test test",
          link: null,
          loading: false,
        },
        loading: false,
      };
    },
    async mounted() {
      if (this.$q.localStorage.has("banner")) {
        this.banner = this.$q.localStorage.getItem("banner");
      }
      this.checker = setInterval(async () => {
        await this.load(this.address, true);
      }, 5000);
    },
    destroyed() {
      this.checker && clearInterval(this.checker);
    },
    methods: {
      async load(address, silent = false) {
        !silent && this.showLoading(true);
        const res = await Promise.all([
          await API.loadMetaData(address),
          await API.loadDaoCells(address),
        ]);
        this.apc = Number(res[0].apc);
        this.items = res[1];
        this.balanceAmount = res[0].balance;
        this.lockedAmount = res[0].locked;
        this.yesterdayAmount = res[0].yesterday;
        this.curYieldAmount = res[0].yieldLive;
        this.cumYieldAmount = res[0].yieldCumulative;

        if (this.banner.show && this.banner.link) {
          if (
            this.items.find((i) =>
              this.banner.link.endsWith(i.outPoint.txHash)
            ) !== undefined
          ) {
            this.banner = {};
            this.$q.localStorage.remove("banner");
          }
        }
        !silent && this.showLoading(false);
      },
      async deposit() {
        this.showLoading(true, "Sending");
        try {
          const txHash = await new PWCore(process.env.CKB_NODE).sendTransaction(
            new DepositBuilder(this.depositAmount),
            new EthSigner(this.address.addressString)
          );
          this.setPendingBanner(txHash);
          console.log("[deposit] txhash:", txHash);
        } catch (e) {
          if (e.message.indexOf("User denied") === -1) {
            this.$q.notify({ color: "negative", message: e.message });
          }
          console.log("[deposit]", e.stack);
        }
        this.showLoading(false);
      },
      async withdraw(cell) {
        this.showLoading(true, "Sending");
        const builder =
          cell.daoType === "withdraw"
            ? new Withdraw2Builder(cell)
            : new Withdraw1Builder(cell);
        try {
          const txHash = await new PWCore(process.env.CKB_NODE).sendTransaction(
            builder,
            new EthSigner(this.address.addressString)
          );
          this.setPendingBanner(txHash);
          console.log("[withdraw], txhash:", txHash);
        } catch (e) {
          this.$q.notify({ color: "negative", message: e.toString() });
          console.error("[withdraw]", e.stack);
        }
        this.showLoading(false);
      },
      openUrl: (url) => openURL(url),
      setPendingBanner(txHash) {
        this.banner = {
          show: true,
          type: "positive",
          loading: true,
          message: this.$t("banner.pending"),
          link: `${process.env.EXPLORER_URL}/transaction/${txHash}`,
        };
        this.$q.localStorage.set("banner", this.banner);
      },
      showLoading(show, message = "Loading") {
        if (show) {
          this.$q.loading.show({
            spinner: QSpinnerBall,
            spinnerSize: "lg",
            spinnerColor: "accent",
            message: `<h6>${message}</h5>`,
            messageColor: "accent",
            backgroundColor: "primary",
          });
        } else {
          this.$q.loading.hide();
        }
      },
    },
    computed: {
      ...mapGetters("pwcore", {
        address: "addressGetter",
      }),
      balance() {
        return this.balanceAmount
          ? new Amount(this.balanceAmount, AmountUnit.shannon).toString(
              AmountUnit.ckb,
              {
                commify: true,
                fixed: 4,
              }
            )
          : "-";
      },
      locked() {
        return this.lockedAmount
          ? new Amount(this.lockedAmount, AmountUnit.shannon).toString(
              AmountUnit.ckb,
              {
                commify: true,
                fixed: 4,
              }
            )
          : "-";
      },
      yesterday() {
        return this.yesterdayAmount
          ? new Amount(this.yesterdayAmount, AmountUnit.shannon).toString(
              AmountUnit.ckb,
              {
                commify: true,
                fixed: 4,
              }
            )
          : "-";
      },
      curYield() {
        return this.curYieldAmount
          ? new Amount(this.curYieldAmount, AmountUnit.shannon).toString(
              AmountUnit.ckb,
              {
                commify: true,
                fixed: 4,
              }
            )
          : "-";
      },
      cumYield() {
        return this.cumYieldAmount
          ? new Amount(this.cumYieldAmount, AmountUnit.shannon).toString(
              AmountUnit.ckb,
              {
                commify: true,
                fixed: 4,
              }
            )
          : "-";
      },
      amount: {
        get() {
          return this.depositAmount.toString(AmountUnit.ckb, { commify: true });
        },
        set(val) {
          if (!val) val = "0";
          val = val.split(",").join("");
          if (val.match(/^\d+(\.\d+)?$/)) {
            this.depositAmount = new Amount(val);
            if (this.depositAmount.lt(new Amount(102))) {
              this.validAmount = this.$t("meta.msg.minimum");
            } else if (
              this.depositAmount.gte(
                new Amount(this.balanceAmount, AmountUnit.shannon)
              )
            ) {
              this.validAmount = this.$t("meta.msg.maximum");
            } else if (
              this.depositAmount.gte(
                new Amount(this.balanceAmount, AmountUnit.shannon).sub(
                  new Amount("62")
                )
              )
            ) {
              this.validAmount = this.$t("meta.msg.minChange");
            } else {
              this.validAmount = true;
            }
          }
        },
      },
      cells() {
        if (this.filter === "locked")
          return this.items.filter((c) => c.daoType !== "complete");
        return this.items.filter((c) => c.daoType === "complete");
      },
    },
    watch: {
      address(address) {
        this.load(address);
      },
      validAmount(val) {
        if (val !== true) {
          Notify.create({
            type: "negative",
            message: val,
            timeout: 3000,
          });
        }
      },
    },
  };
</script>

<style lang="scss" scoped>
  .main {
    background: #dfdfdf;
  }

  .dashboard {
    height: 240px;
    z-index: 2;
  }
  .dashboard .a {
    background-color: $primary;
  }
  .dashboard .b {
    background: linear-gradient(to bottom, $primary 50%, transparent 50%);
  }

  .stat {
    border-radius: 8px;
  }

  .meta-text {
    font-size: 0.8em;
    font-weight: 500;
  }

  .deposit {
    height: 80px;
    margin-top: -10px;
    z-index: 1;
  }

  .amount-input {
    font-size: 1.2em;
  }

  .filter-wrapper {
    border-radius: 5px;
    background: #eee;
  }
  .filter-button {
    border-radius: 5px;
  }
  .filter-active {
    color: $accent;
    background: white;
    z-index: 1;
  }
  .filter-inactive {
    color: lighten($accent, 50%);
    background: transparent;
    z-index: 0;
  }

  .positive-banner {
    background: $light-green-1;
    color: $primary;
  }
  .warning-banner {
    background: $amber-1;
    color: $warning;
  }
  .negative-banner {
    background: $red-1;
    color: $negative;
  }
</style>