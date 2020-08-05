import PWCore, {
  Cell,
  Transaction,
  RawTransaction,
  DAO_WITHDRAW_2_WITNESS_LEN,
  Builder
} from "@lay2/pw-core";
import JSBI from "jsbi";

const { BigInt } = JSBI;

const DAO_LOCK_PERIOD_EPOCHS = process.env.DAO_LOCK_PERIOD_EPOCHS;

export default class Withdraw2Builder extends Builder {
  constructor(withdraw1DaoCell) {
    super();
    this.cell = withdraw1DaoCell;
  }

  async build(fee) {
    const withdraw2Cell = new Cell(this.cell.currentCapacity, this.cell.lock);

    const raw = new RawTransaction([this.cell], [withdraw2Cell]);
    raw.cellDeps.push(PWCore.config.daoType.cellDep);
    raw.headerDeps = [
      this.cell.depositHeader.hash,
      this.cell.withdrawHeader.hash
    ];
    raw.inputs[0].since = this.getSince(this.cell);

    const witnessArgs = [
      { ...Builder.WITNESS_ARGS.Secp256k1, input_type: "0x0000000000000000" }
    ];
    const tx = new Transaction(raw, witnessArgs, DAO_WITHDRAW_2_WITNESS_LEN);
    this.fee = Builder.calcFee(tx);
    tx.raw.outputs[0].capacity = withdraw2Cell.capacity.sub(this.fee);
    tx.witnesses;

    return tx;
  }

  getSince(cell) {
    const depositEpoch = cell.depositHeader.epoch;
    const settleEpoch = cell.withdrawHeader.epoch;

    const settleFraction = JSBI.multiply(
      BigInt(settleEpoch.index),
      BigInt(depositEpoch.length)
    );
    const depositFraction = JSBI.multiply(
      BigInt(depositEpoch.index),
      BigInt(settleEpoch.length)
    );
    let depositedEpochs = JSBI.subtract(
      BigInt(settleEpoch.number),
      BigInt(depositEpoch.number)
    );
    if (JSBI.GT(settleFraction, depositFraction))
      depositedEpochs = JSBI.add(depositedEpochs, BigInt(1));
    const lockEpochs = JSBI.multiply(
      JSBI.divide(
        JSBI.add(depositedEpochs, BigInt(DAO_LOCK_PERIOD_EPOCHS - 1)),
        BigInt(DAO_LOCK_PERIOD_EPOCHS)
      ),
      BigInt(DAO_LOCK_PERIOD_EPOCHS)
    );
    return absoluteEpochSince({
      length: numberToHexString(depositEpoch.length),
      index: numberToHexString(depositEpoch.index),
      number: numberToHexString(
        JSBI.add(BigInt(depositEpoch.number), lockEpochs)
      )
    });
  }
}

const numberToHexString = n => {
  typeof n !== "bigint" && (n = BigInt(n));
  return `0x${n.toString(16)}`;
};

export const absoluteEpochSince = ({ length, index, number }) => {
  const epochSince = JSBI.add(
    JSBI.add(
      JSBI.add(
        JSBI.leftShift(BigInt(0x20), BigInt(56)),
        JSBI.leftShift(BigInt(length), BigInt(40))
      ),
      JSBI.leftShift(BigInt(index), BigInt(24))
    ),
    BigInt(number)
  );

  return numberToHexString(epochSince);
};
