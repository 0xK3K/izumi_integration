import Web3 from "web3";
import { ethers } from "ethers";
import { getSwapContract, getSwapSingleWithExactInputCall, SwapSingleWithExactInputParams } from "iziswap-sdk/lib/swap";
import { ChainId, fetchToken, initialChainTable } from "iziswap-sdk/lib/base";
import {
  getQuoterContract,
  quoterSwapSingleWithExactInput,
  QuoterSwapSingleWithExactInputParams
} from "iziswap-sdk/lib/quoter";
import BigNumber from "bignumber.js";
import { IZUMI_SCROLL_QUOTER_CONTRACT, IZUMI_SCROLL_SWAP_ROUTER } from "./constants";

export class Izumi {

  public async izumiSwap(
    fromToken: string,
    toToken: string,
    amount: string,
    pubkey: string,
    url: string
  ) {

    const chain = initialChainTable[ChainId.Scroll];

    const web3 = new Web3(new Web3.providers.HttpProvider(url));

    const quoterContract = getQuoterContract(IZUMI_SCROLL_QUOTER_CONTRACT, web3);
    const swapContract = getSwapContract(IZUMI_SCROLL_SWAP_ROUTER, web3);

    const fee = 3000; // the % fee of the pool
    const inputToken = await fetchToken(fromToken, chain, web3);
    const outputToken = await fetchToken(toToken, chain, web3);

    const inputAmount = ethers.parseUnits(amount, inputToken.decimal).toString()
    const params = {
      inputToken,
      outputToken,
      fee,
      inputAmount
    } as QuoterSwapSingleWithExactInputParams

    const { outputAmount } = await quoterSwapSingleWithExactInput(quoterContract, params)

    const swapParams = {
      ...params,
      // slippery is 1.5%
      minOutputAmount: new BigNumber(outputAmount).times(0.985).toFixed(0)
    } as SwapSingleWithExactInputParams

    const gasPrice = 1000000000n

    const { swapCalling, } = getSwapSingleWithExactInputCall(
      swapContract,
      pubkey,
      chain,
      swapParams,
      ethers.formatUnits(gasPrice, "wei")
    )

    const tx = {
      to: IZUMI_SCROLL_SWAP_ROUTER,
      data: swapCalling.encodeABI(),
      gasPrice,
      value: inputAmount
    };

    return tx
  }
}
