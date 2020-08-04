export default {
  meta: {
    label: {
      slogan: "CKB Locked for Yield",
      apc: "Annual Yield Rate",
      balance: "Balance",
      locked: "Deposited in DAO",
      yesterday: "Yesterday",
      cur_yield: "Yield",
      cum_yield: "Cumulative"
    },
    btn: { deposit: "Deposit", wallet: "Go to Wallet" }
  },

  dao_item: {
    label: {
      deposited_at: "deposited at",
      withdrawn_at: "withdrawn at",
      completed_at: "completed at",
      confirm: "Confirm",
      risk_notice: "Risk Notice"
    },
    btn: {
      settle: "Settle",
      withdraw: "Withdraw",
      confirm: "Confirm",
      cancel: "Cancel"
    }
  },

  filter: {
    locked: "Locked",
    unlocked: "Unlocked"
  },

  banner: {
    pending: "Transaction pending"
  },

  phase_hint: {
    1: "Settlement can be performed after {hours} hours",
    2: "Next compensation period starts in {days} days, {hours} hours. Yield is too low, settlement is not recommended",
    3: "Next compensation period starts in {days} days, {hours} hours. Settlement is recommended for maximum yield",
    4: "Next compensation period starts in {hours} hours. Please ensure that the withdraw transaction can be packaged before the end of this period, or the withdraw request will be postponed for at least 30 days",
    5: "Withdraw can be performed after {hours} hours",
    6: "Withdraw can be performed after {days} days, {hours} hours",
    7: "You can withdraw CKB to your account now"
  },

  phase_alert: {
    1: "",
    2: "Notice: withdraw can be performed after {blocks} blocks (about {days} days, {hours} hours)",
    3: "Notice: withdraw can be performed after {blocks} blocks (about {days} days, {hours} hours)",
    4: "Warning: There are only {blocks} blocks (about {hours} hours) left before this period ends. Please ensure that the withdraw transaction can be packaged before the end of this period, or the withdraw request will be postponed for at least 30 days",
    5: "",
    6: "",
    7: ""
  }
};
