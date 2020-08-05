<template>
  <div class="column container q-px-md q-py-sm">
    <div class="col row justify-between items-center">
      <div class="col column q-gutter-xs">
        <div class="row items-center">
          <div class="text-accent cap-text q-mr-xs">{{capacity}} CKB</div>
          <q-chip
            square
            color="lime-1"
            text-color="primary"
            size="0.8em"
            dense
            :label="`+${revenue} CKB`"
          />
        </div>
        <div class="col row justify-start items-center">
          <div
            class="text-caption text-grey q-mr-sm"
          >{{$t('dao_item.label.deposited_at')}} {{depositedAt}}</div>
          <div v-if="completedAt" class="row text-caption text-grey q-mr-sm">
            <div class="q-mx-sm">-</div>
            {{$t('dao_item.label.completed_at')}} {{completedAt}}
          </div>
          <div v-else-if="withdrawnAt" class="row text-caption text-grey q-mr-sm">
            <!-- <div class="q-mx-sm">-</div> -->
            {{$t('dao_item.label.withdrawn_at')}} {{withdrawnAt}}
          </div>
          <div>
            <q-btn
              v-if="!completedAt"
              size="sm"
              dense
              round
              unelevated
              flat
              color="grey-5"
              icon="info"
            >
              <q-tooltip
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
                max-width="50%"
              >{{phaseHint}}</q-tooltip>
            </q-btn>
            <q-btn
              color="primary"
              flat
              unelevated
              round
              dense
              icon="ion-md-open"
              size="sm"
              @click="openExplorer(cell.outPoint.txHash)"
            />
          </div>
        </div>
      </div>
      <div v-if="cell.daoType !== 'complete'" class="column">
        <q-btn
          rounded
          unelevated
          :color="`${cell.daoType ==='withdraw' ? 'primary' : 'accent'}`"
          no-caps
          :disable="!canWithdraw"
          :label="$t(`dao_item.btn.${cell.daoType ==='withdraw' ? 'withdraw' : 'settle'}`)"
          @click="cell.phase === 7 ? withdraw() : confirm = true"
        />
      </div>
    </div>
    <div v-if="cell.daoType !== 'complete'" class="col row">
      <q-linear-progress
        :value="progress"
        rounded
        :color="progressColor"
        track-color="lightgrey"
        class="q-my-sm"
      />
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="confirm" position="bottom" persistent>
      <q-card class="q-ma-lg q-pa-md">
        <div class="column items-center">
          <span
            class="text-accent text-center text-bold"
          >{{$t(cell.phase === 4 ? 'dao_item.label.risk_notice':'dao_item.label.confirm')}}</span>
          <span
            v-if="cell.phase !== undefined"
            class="text-grey q-my-md"
          >{{$t(`phase_alert.${cell.phase}`, {blocks: 180 - cell.epochsPast, hours: cell.hoursLeft, days: cell.daysLeft})}}</span>
        </div>
        <div v-if="cell.phase === 4" class="row q-gutter-sm">
          <q-btn
            class="col"
            unelevated
            :label="$t('dao_item.btn.confirm')"
            color="negative"
            @click="withdraw"
            v-close-popup
          />
          <q-btn
            class="col"
            unelevated
            :label="$t('dao_item.btn.cancel')"
            color="accent"
            v-close-popup
          />
        </div>
        <div v-else class="row q-gutter-sm">
          <q-btn
            class="col"
            unelevated
            :label="$t('dao_item.btn.cancel')"
            color="accent"
            v-close-popup
          />
          <q-btn
            class="col"
            unelevated
            :label="$t('dao_item.btn.settle')"
            color="primary"
            @click="withdraw"
            v-close-popup
          />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
  import { AmountUnit } from "@lay2/pw-core";
  import { DaoCell } from "../models";
  import { openURL } from "quasar";
  export default {
    name: "DaoItem",
    props: ["cell"],
    data() {
      return {
        stage: this.cell.stage,
        progress: this.cell.progress,
        blocks: this.cell.blocks,
        days: this.cell.daysLeft,
        hours: this.cell.hoursLeft,
        epochs: this.cell.epochsPast,
        confirm: false,
      };
    },
    computed: {
      capacity() {
        return this.cell.capacity.toString(AmountUnit.ckb, { commify: true });
      },
      revenue() {
        return this.cell.revenue.toString(AmountUnit.ckb, {
          commify: true,
          fixed: 5,
        });
      },
      depositedAt() {
        return new Date(this.cell.depositedAt).toLocaleDateString();
      },
      withdrawnAt() {
        return this.cell.withdrawnAt
          ? new Date(this.cell.withdrawnAt).toLocaleDateString()
          : null;
      },
      completedAt() {
        return this.cell.completedAt
          ? new Date(this.cell.completedAt).toLocaleDateString()
          : null;
      },
      canWithdraw() {
        return [2, 3, 4, 7].find((p) => p === this.cell.phase) !== undefined;
      },
      progressColor() {
        const { phase } = this.cell;
        if ([1, 5, 6].find((p) => p === phase)) return "grey";
        if (phase === 2) return "warning";
        if (phase === 4) return "negative";
        return "primary";
      },
      phaseHint() {
        const { phase } = this.cell;
        if (!phase) return "";
        return this.$t(`phase_hint.${phase}`, {
          hours: this.cell.hoursLeft,
          days: this.cell.daysLeft,
          blocks: 180 - this.cell.epochsPast,
        });
      },
    },
    methods: {
      withdraw() {
        this.$emit("withdraw", this.cell);
      },
      openExplorer: (txHash) =>
        openURL(`${process.env.EXPLORER_URL}/transaction/${txHash}`),
    },
  };
</script>

<style lang="scss" scoped>
  .container {
    background: white;
    border-radius: 5px;
  }

  .cap-text {
    font-size: 1.15em;
    font-weight: 500;
  }

  .q-chip {
    margin: 0;
  }
</style>