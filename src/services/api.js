import { DaoCell } from "src/models";
import { Notify } from "quasar";
import PWCore, { Amount, OutPoint, AmountUnit } from "@lay2/pw-core";
import axios from "axios";

const BASE_URL = process.env.BASE_URL;

const apiGet = async (url, params) => get(BASE_URL + url, params);
const apiPost = async (url, params) => post(BASE_URL + url, params);

const API = {
  loadMetaData: async () => {
    const res = await apiGet("/dao/stats", {
      lockHash: PWCore.provider.address.toLockScript().toHash()
    });

    const { estimated_apc: apc } = res.data.global;
    const { balance, locked, yieldLive, yieldCumulative } = res.data.user;

    return { apc, balance, locked, yieldLive, yieldCumulative };
  },

  loadDaoCells: async type => {
    const cells = (
      await apiGet("/dao/daoList", {
        lockHash: PWCore.provider.address.toLockScript().toHash(),
        type
      })
    ).data;
    const daoCells = [];
    for (let cell of cells) {
      daoCells.push(
        new DaoCell(
          new Amount(cell.size, AmountUnit.shannon),
          PWCore.provider.address.toLockScript(),
          new OutPoint(cell.hash, "0x" + Number(cell.index).toString(16)),
          null,
          new Amount(cell.countedCapacity, AmountUnit.shannon),
          cell.depositBlockHeader,
          cell.withdrawBlockHeader,
          cell.withdraw2BlockHeader,
          cell.rate,
          cell.type,
          cell.phase,
          cell.leftHours,
          cell.leftDays,
          cell.pastEpochs
        )
      );
    }

    return daoCells;
  }
};

export default API;

export const get = async (url, params) => {
  url += "?";
  for (let p in params) {
    if (params[p]) {
      url += `${p}=${params[p]}&`;
    }
  }
  let ret = null;
  try {
    ret = await axios.get(url);
  } catch (e) {
    // GTM.logEvent({
    //   category: 'exceptions',
    //   action: `Error: ${e.toString()} | Params: ${JSON.stringify(params)}`,
    //   label: '[API] - ' + url.split('/').pop()
    // })
    Notify.create({
      message: "[API] - " + e.toString(),
      position: "top",
      timeout: 2000,
      color: "negative"
    });
  }

  return ret.data;
};

const post = async (url, params) => {
  let ret = null;
  try {
    ret = await axios.post(url, params);
  } catch (e) {
    // GTM.logEvent({
    //   category: 'exceptions',
    //   action: `Error: ${e.toString()} | Params: ${JSON.stringify(params)}`,
    //   label: '[API] - ' + url.split('/').pop()
    // })
    Notify.create({
      message: "[API] - " + e.toString() + "Params: " + JSON.parse(params),
      position: "top",
      timeout: 2000,
      color: "negative"
    });
  }

  return ret.data;
};

/*
getDaoCells: async (filter = null) => {
    const cells = []
    if (filter === 'locked') {
      const cell = new DaoCell(
        new Amount('1000'),
        PWCore.provider.address.toLockScript(),
        // new Address('0xDc788AF054e68BB012792a77b4f6b74c29335071', AddressType.eth),
        new OutPoint('0xaaaaaaa', '0x0'),
        '0x00000000',
        new Amount('10'),
        new Date().getTime(),
        null,
        12,
        0.5,
        200000
      )
      for (let i = 0; i < 5; i++) {
        cells.push({ ...cell, progress: 0.2 * i + 0.15 });
      }
    } else if (filter === 'unlocked') {
      const cell = new DaoCell(
        new Amount('1000'),
        PWCore.provider.address.toLockScript(),
        // new Address('0xDc788AF054e68BB012792a77b4f6b74c29335071', AddressType.eth),
        new OutPoint('0xaaaaaaa', '0x0'),
        '0x00000000',
        new Amount('10'),
        new Date().getTime() - 20 * 86400 * 1000,
        new Date().getTime(),
        12,
        0.5,
        200000
      )
      for (let i = 0; i < 5; i++) {
        cells.push(cell);
      }
    } else {

    }
    return cells;
  }
*/
