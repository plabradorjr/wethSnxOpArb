const { ethers } = require("ethers");
const ERC20ABI = require("./abi.json");
const { token0, token1, token2 } = require("./immutables");

require("dotenv").config();
const OPTIMISM_WSS_MAINNET = process.env.OPTIMISM_WSS_MAINNET;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const WALLET_SECRET = process.env.WALLET_SECRET;

const provider = new ethers.providers.WebSocketProvider(OPTIMISM_WSS_MAINNET);
const wallet = new ethers.Wallet(WALLET_SECRET);
const connectedWallet = wallet.connect(provider);

const swapRouterAddress = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

///////////////// START HERE /////////////

async function approveToken(tokenAddressToApprove) {
  const tokenContract0 = new ethers.Contract(
    tokenAddressToApprove,
    ERC20ABI,
    provider
  );

  const approvalResponse = await tokenContract0
    .connect(connectedWallet)
    .approve(swapRouterAddress, "1000000000000000000000000000");

  console.log(approvalResponse);
}

approveToken(token2.address);
