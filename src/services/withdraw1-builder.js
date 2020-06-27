import PWCore, {
  Builder,
  Cell,
  RawTransaction,
  Transaction
} from "@lay2/pw-core";

export default class Withdraw1Builder extends Builder {
  constructor(depositedDaoCell) {
    super();
    this.cell = depositedDaoCell;
  }

  async build(fee) {
    const withdraw1Cell = new Cell(
      this.cell.capacity,
      this.cell.lock,
      this.cell.type,
      null,
      toHexLE(this.cell.depositHeader.number)
    );

    let neededAmount = Builder.MIN_CHANGE;

    if (fee) {
      neededAmount = neededAmount.add(fee);
    }

    const inputCells = await PWCore.defaultCollector.collect(
      this.cell.lock.toAddress(),
      neededAmount
    );

    const inputAmount = inputCells
      .map(c => c.capacity)
      .reduce((sum, a) => sum.add(a));

    if (inputAmount.lt(neededAmount)) {
      throw new Error(`input capacity not enough. 
        Need ${neededAmount.toString(AmountUnit.ckb)}, 
        got ${inputAmount.toString(AmountUnit.ckb)}`);
    }

    const changeCell = new Cell(inputAmount, this.cell.lock);

    const tx = new Transaction(
      new RawTransaction(
        [this.cell, ...inputCells],
        [withdraw1Cell, changeCell]
      ),
      [Builder.WITNESS_ARGS.Secp256k1]
    );

    tx.raw.cellDeps.push(PWCore.config.daoType.cellDep);
    tx.raw.headerDeps.push(this.cell.depositHeader.hash);

    console.log("[Withdraw1Builder build] tx:", tx);

    this.fee = Builder.calcFee(tx);

    if (inputAmount.gte(Builder.MIN_CHANGE.add(this.fee))) {
      changeCell.capacity = changeCell.capacity.sub(this.fee);
      tx.raw.outputs.pop();
      tx.raw.outputs.push(changeCell);

      return tx;
    }

    return this.build(this.fee);
  }
}

function toHexLE(num) {
  let hex = Number(num).toString(16);
  const data = hex.padStart(hex.length + (hex.length % 2), "0").match(/../g);
  return (
    "0x" +
    data
      .reverse()
      .join("")
      .padEnd(16, "0")
  );
}
