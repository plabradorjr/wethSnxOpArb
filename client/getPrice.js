// https://docs.uniswap.org/protocol/reference/deployments
// https://docs.uniswap.org/sdk/guides/creating-a-trade

const { ethers } = require("ethers");

require("dotenv").config();
const OPTIMISM_WSS_MAINNET = process.env.OPTIMISM_WSS_MAINNET;

const {
  abi: QuoterABI,
} = require("@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json");

const provider = new ethers.providers.WebSocketProvider(OPTIMISM_WSS_MAINNET);

exports.getPrice = async (tokenFrom, tokenTo, amountInHuman, poolFee) => {
  const quoterAddress = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6";

  const quoterContract = new ethers.Contract(
    quoterAddress,
    QuoterABI,
    provider
  );

  const amountIn = ethers.utils.parseUnits(
    amountInHuman.toString(),
    tokenFrom.decimals
  );

  const quoteAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
    tokenFrom.address,
    tokenTo.address,
    poolFee,
    amountIn.toString(),
    0
  );

  // Output the amount
  const amountOut = ethers.utils.formatUnits(
    quoteAmountOut.toString(),
    tokenTo.decimals
  );
  return amountOut;
};
