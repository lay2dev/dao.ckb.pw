import PWCore, {
  Builder,
  Cell,
  Transaction,
  RawTransaction,
  AmountUnit
} from "@lay2/pw-core";

export default class DepositBuilder extends Builder {
  constructor(capacity) {
    super();
    this.capacity = capacity;
  }

  async build(fee) {
    const { address } = PWCore.provider;

    const depositCell = new Cell(
      this.capacity,
      address.toLockScript(),
      PWCore.config.daoType.script,
      null,
      "0x0000000000000000"
    );

    let neededAmount = this.capacity;
    if (fee) neededAmount = neededAmount.add(fee);

    const inputCells = await PWCore.defaultCollector.collect(address, {
      neededAmount
    });
    const inputAmount = inputCells
      .map(c => c.capacity)
      .reduce((sum, a) => sum.add(a));
    if (inputAmount.lt(neededAmount)) {
      throw new Error(`input capacity not enough. 
        Need ${neededAmount.toString(AmountUnit.ckb)}, 
        got ${inputAmount.toString(AmountUnit.ckb)}`);
    }
    const changeCell = new Cell(
      inputAmount.sub(neededAmount),
      address.toLockScript()
    );

    const raw = new RawTransaction(inputCells, [depositCell, changeCell]);
    raw.cellDeps.push(PWCore.config.daoType.cellDep);
    const tx = new Transaction(raw, [Builder.WITNESS_ARGS.Secp256k1]);
    this.fee = Builder.calcFee(tx);

    if (changeCell.capacity.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);
      console.log("[deposit-builder] tx: ", tx);
      return tx;
    }

    return this.build(this.fee);
  }
}
