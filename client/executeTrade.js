const { ethers } = require("ethers");

const {
  abi: SwapRouterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/interfaces/ISwapRouter.sol/ISwapRouter.json");

const ERC20ABI = require("./abi.json");

require("dotenv").config();
const OPTIMISM_WSS_MAINNET = process.env.OPTIMISM_WSS_MAINNET;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const WALLET_SECRET = process.env.WALLET_SECRET;

const provider = new ethers.providers.WebSocketProvider(OPTIMISM_WSS_MAINNET);
const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

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

async function executeTrade(
  amountInHuman,
  tokenFrom,
  tokenTo,
  poolFee,
  tokenFromDecimals
) {
  // const state = await getPoolState(poolContract) // /////// this code wasnt needed
  const wallet = new ethers.Wallet(WALLET_SECRET);
  const connectedWallet = wallet.connect(provider);

  const swapRouterContract = new ethers.Contract(
    swapRouterAddress,
    SwapRouterABI,
    provider
  );

  const amountIn = ethers.utils.parseUnits(
    amountInHuman.toString(),
    tokenFromDecimals
  );

  const params = {
    tokenIn: tokenFrom,
    tokenOut: tokenTo,
    fee: poolFee,
    recipient: WALLET_ADDRESS,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn: amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  //////////////// perform swap /////////
  const transaction = await swapRouterContract
    .connect(connectedWallet)
    .exactInputSingle(params, {
      gasLimit: ethers.utils.hexlify(400000),
      gasPrice: (await provider.getGasPrice()) * 3,
    })
    .then((transaction) => {
      const txHash = transaction.hash;
      console.log("swap started, tx hash:", txHash);
      let txnOutputs = txnCheck(txHash, tokenTo);
      return txnOutputs;
    });

  return transaction;
}

//// wait for swap to be mined ////
async function txnCheck(txnHash, addr) {
  const tokenContract = new ethers.Contract(addr, ERC20ABI, provider);
  const tokenName = await tokenContract.name();
  const tokenDecimals = await tokenContract.decimals();

  let txn_test = await provider.waitForTransaction(txnHash);
  console.log("success, confirmations:", txn_test.confirmations);
  const outputBal = await tokenContract.balanceOf(WALLET_ADDRESS);

  let outputHuman = ethers.utils.formatUnits(outputBal, tokenDecimals);

  console.log(`${tokenName} balance:`, outputHuman);

  let txnMined = { balance: outputHuman, decimals: tokenDecimals };
  return txnMined;
}

exports.trade012sequence = async () => {
  let t1 = await executeTrade(
    initialToken0InputHuman, // amountInHuman
    token0.address, // tokenFrom
    token1.address, // tokenTo
    t0t1Pool.fee, // poolFee
    token0.decimals // tokenFromDecimals
  );
  let t2 = await executeTrade(
    t1.balance,
    token1.address,
    token2.address,
    t1t2Pool.fee,
    token1.decimals
  );
  let t3 = await executeTrade(
    t2.balance,
    token2.address,
    token0.address,
    t2t0Pool.fee,
    token2.decimals
  );
  return;
};

exports.trade021sequence = async () => {
  let t1 = await executeTrade(
    initialToken0InputHuman,
    token0.address,
    token2.address,
    t2t0Pool.fee,
    token0.decimals
  );
  let t2 = await executeTrade(
    t1.balance,
    token2.address,
    token1.address,
    t1t2Pool.fee,
    token2.decimals
  );
  let t3 = await executeTrade(
    t2.balance,
    token1.address,
    token0.address,
    t0t1Pool.fee,
    token1.decimals
  );
  return;
};
