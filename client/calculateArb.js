const ethers = require("ethers");

const { getPrice } = require("./getPrice");

const { pairABI } = require("./AbiList");
const { trade012sequence, trade021sequence } = require("./executeTrade");

require("dotenv").config();
const OPTIMISM_WSS_MAINNET = process.env.OPTIMISM_WSS_MAINNET;
const provider = new ethers.providers.WebSocketProvider(OPTIMISM_WSS_MAINNET);

const {
  gasCostTrade,
  initialToken0InputHuman,
  token0,
  token1,
  token2,
  t0t1Pool,
  t1t2Pool,
  t2t0Pool,
} = require("./immutables");

let isExecuting = false;

const calculateArb = async () => {
  console.log("🤖 calculating arb...");
  let t1 = await getPrice(
    token0,
    token1,
    initialToken0InputHuman,
    t0t1Pool.fee
  );
  let t2 = await getPrice(token1, token2, t1, t1t2Pool.fee);
  let t3 = await getPrice(token2, token0, t2, t2t0Pool.fee);
  if (t3 - gasCostTrade > initialToken0InputHuman) {
    console.log("ARBITRAGE FOUND");
    console.log(
      "estimated weth GAIN:",
      t3 - gasCostTrade - initialToken0InputHuman
    );
    await trade012sequence();
    isExecuting = false;
    return;
  } else {
    console.log(
      "trade #1 estimated WETH lost:",
      t3 - gasCostTrade - initialToken0InputHuman
    );
    let r1 = await getPrice(
      token0,
      token2,
      initialToken0InputHuman,
      t2t0Pool.fee
    );
    let r2 = await getPrice(token2, token1, r1, t1t2Pool.fee);
    let r3 = await getPrice(token1, token0, r2, t0t1Pool.fee);

    if (r3 - gasCostTrade > initialToken0InputHuman) {
      console.log("ARB FOUND!");
      console.log(
        "estimated weth GAIN:",
        r3 - gasCostTrade - initialToken0InputHuman
      );
      await trade021sequence();
      isExecuting = false;
      return;
    } else {
      console.log(
        "trade #2 estimated WETH lost:",
        r3 - gasCostTrade - initialToken0InputHuman
      );
      isExecuting = false;
      console.log("🦧🦧🦧listening for swap events.... ");
      return;
    }
  }
};

// calculateArb();

const listenForSwap = async () => {
  const t0t1Pair = new ethers.Contract(t0t1Pool.address, pairABI, provider);
  const t1t2Pair = new ethers.Contract(t1t2Pool.address, pairABI, provider);
  const t2t0Pair = new ethers.Contract(t2t0Pool.address, pairABI, provider);

  t0t1Pair.on(
    "Swap",
    async (
      sender,
      recipient,
      amount0,
      amount1,
      sqrtPriceX96,
      liquidity,
      tick
    ) => {
      if (!isExecuting) {
        isExecuting = true;
        console.log(`Swap detected ${t0t1Pool.pairName}, sender: `, sender);
        console.log("recipient: ", recipient);
        calculateArb();
        return;
      }
      return;
    }
  );

  t1t2Pair.on(
    "Swap",
    async (
      sender,
      recipient,
      amount0,
      amount1,
      sqrtPriceX96,
      liquidity,
      tick
    ) => {
      if (!isExecuting) {
        isExecuting = true;
        console.log(`Swap detected ${t1t2Pool.pairName}, sender: `, sender);
        console.log("recipient: ", recipient);
        calculateArb();
        return;
      }
      return;
    }
  );

  t2t0Pair.on(
    "Swap",
    async (
      sender,
      recipient,
      amount0,
      amount1,
      sqrtPriceX96,
      liquidity,
      tick
    ) => {
      if (!isExecuting) {
        isExecuting = true;
        console.log(`Swap detected ${t2t0Pool.pairName}, sender: `, sender);
        console.log("recipient: ", recipient);
        calculateArb();
        return;
      }
      return;
    }
  );

  const calculateArbEveryXtime = async () => {
    if (!isExecuting) {
      isExecuting = true;
      console.log("calculating arb every 1 minute..... 👀");
      calculateArb();
      return;
    }
    return;
  };

  const ten_minutes = 1000 * 60 * 10;

  setInterval(calculateArbEveryXtime, ten_minutes);

  console.log("🦧 Waiting for swap event...");
  return;
};

const calculateArbOnceNow = async () => {
  isExecuting = true;
  calculateArb();
};

calculateArbOnceNow();
listenForSwap();
