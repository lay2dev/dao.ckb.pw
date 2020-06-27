import PWCore, { Cell } from "@lay2/pw-core";

export class DaoCell extends Cell {
  constructor(
    capacity,
    lock,
    outPoint,
    data,
    currentCapacity,
    depositHeader,
    withdrawHeader,
    completeHeader,
    apc,
    daoType,
    phase,
    hoursLeft,
    daysLeft,
    epochsPast
  ) {
    super(capacity, lock, PWCore.config.daoType.script, outPoint, data);
    this.revenue = currentCapacity.sub(capacity);
    this.apc = apc;
    this.daoType = daoType;
    this.phase = phase;
    this.depositHeader = depositHeader;
    this.depositedAt = depositHeader.timestamp;
    this.withdrawHeader = withdrawHeader;
    this.withdrawnAt = withdrawHeader ? withdrawHeader.timestamp : null;
    this.completeHeader = completeHeader;
    this.completedAt = completeHeader ? completeHeader.timestamp : null;
    this.hoursLeft = hoursLeft;
    this.daysLeft = daysLeft;
    this.epochsPast = epochsPast;
    this.progress = parseFloat((epochsPast / 180.0).toFixed(2));
  }
}
