const { ethers } = require("ethers");
require("dotenv").config();

//////////////////////////////  Gas and initial input //////////////////////
const gasCostTrade = 0.00019;
const initialToken0InputHuman = 0.006;

//////////////////////////////   Tokens    /////////////////////////////////
const token0 = {
  address: "0x4200000000000000000000000000000000000006",
  name: "Wrapped Ether",
  symbol: "WETH",
  decimals: 18,
};

const token1 = {
  address: "0x8700daec35af8ff88c16bdf0418774cb3d7599b4",
  name: "Synthetix Network Token Token",
  symbol: "SNX",
  decimals: 18,
};

const token2 = {
  address: "0x4200000000000000000000000000000000000042",
  name: "Optimism",
  symbol: "OP",
  decimals: 18,
};

/////////////////////////////      Pools    //////////////////////////////

// weth-snx 0.3% fee
const t0t1Pool = {
  address: "0x0392b358ce4547601befa962680bede836606ae2",
  fee: 3000,
  pairName: "WETH / SNX",
};

// snx-op 0.3% fee
const t1t2Pool = {
  address: "0xd5b2f311e62eafaad2b1814a067f04ba4de63458",
  fee: 3000,
  pairName: "SNX / OP",
};

// op-weth 0.3% fee
const t2t0Pool = {
  address: "0x68f5c0a2de713a54991e01858fd27a3832401849",
  fee: 3000,
  pairName: "OP / WETH",
};

module.exports = {
  gasCostTrade,
  initialToken0InputHuman,
  token0,
  token1,
  token2,
  t0t1Pool,
  t1t2Pool,
  t2t0Pool,
};
