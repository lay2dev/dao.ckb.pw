export default {
  meta: {
    label: {
      slogan: "锁定生息的 CKB",
      apc: "当前年化补贴率",
      balance: "可存金额",
      locked: "已存金额",
      yesterday: "昨日收益",
      cur_yield: "当前收益",
      cum_yield: "累计收益"
    },
    btn: { deposit: "存入", wallet: "前往钱包" },
    msg: {
      minimum: "最小金额为 102 CKB",
      maximum: "余额不足",
      minChange: "钱包剩余金额不能小于 62 CKB，以备后续提现作为手续费"
    }
  },

  dao_item: {
    label: {
      deposited_at: "存于",
      withdrawn_at: "取于",
      completed_at: "完成于",
      confirm: "确认操作",
      risk_notice: "风险提示"
    },
    btn: {
      settle: "结算",
      withdraw: "提现",
      confirm: "确认",
      cancel: "取消"
    }
  },

  filter: {
    locked: "收益中",
    unlocked: "已解锁"
  },

  banner: {
    pending: "交易发送中"
  },

  phase_hint: {
    1: "锁定中，{hours} 小时后可以进行结算操作",
    2: "下一个补偿周期约在 {days} 天 {hours} 小时后开始，当前补偿金额较低，不建议此时进行结算",
    3: "下一个补偿周期约在 {days} 天 {hours} 小时后开始，如需结算，建议在当前区间内操作以获取较高的补偿金额",
    4: "下一个补偿周期约在 {hours} 小时后开始，请确保提现交易能够在本周期结束前上链，否则提现将被推迟30天",
    5: "锁定中，{hours} 小时后可以进行提现操作",
    6: "锁定中，{days} 天 {hours} 小时后可以进行提现操作",
    7: "现在可以发起提现操作"
  },

  phase_alert: {
    1: "",
    2: "注意：需要等待 {blocks} 个 Epoch（约 {days} 天 {hours} 小时）才能进行提现操作",
    3: "注意：需要等待 {blocks} 个 Epoch（约 {days} 天 {hours} 小时）才能进行提现操作",
    4: "注意: 距离本补偿周期结束还有 {blocks} 个 Epoch（约 {hours} 小时），请确保交易在本周期结束前上链，否则您需要再等待 30 天才能完成提现操作",
    5: "",
    6: "",
    7: ""
  }
};
