/*
 *Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features*
 */

import {
  SwapContractContract_Swap_loader,
  SwapContractContract_Swap_handler,
} from "../generated/src/Handlers.gen";
import { liquidityPoolEntity } from "./src/Types.gen";

SwapContractContract_Swap_loader(({ event, context }) => {
  context.LiquidityPool.load(event.srcAddress.toString());
});

SwapContractContract_Swap_handler(({ event, context }) => {
  console.log(event.transactionHash);
  console.log(event.blockNumber);

  let currentLiquidityPool = context.LiquidityPool.get(
    event.srcAddress.toString()
  );

  if (currentLiquidityPool == undefined) {
    currentLiquidityPool = {
      id: event.srcAddress.toString(),
      name: "",
      symbol: "",
      tick: event.params.tick,
      cumulativeVolumeByTokenAmount: [
        event.params.amount0,
        event.params.amount1,
      ],
      cumulativeSwapCount: 1,
      lastUpdateTimestamp: BigInt(event.blockTimestamp),
      lastUpdateBlockNumber: BigInt(event.blockNumber),
    };
  } else {
    currentLiquidityPool = {
      id: event.srcAddress.toString(),
      name: "",
      symbol: "",
      tick: event.params.tick,
      cumulativeVolumeByTokenAmount: [
        currentLiquidityPool.cumulativeVolumeByTokenAmount[0] +
          event.params.amount0,
        currentLiquidityPool.cumulativeVolumeByTokenAmount[1] +
          event.params.amount1,
      ],
      cumulativeSwapCount: currentLiquidityPool.cumulativeSwapCount + 1,
      lastUpdateTimestamp: BigInt(event.blockTimestamp),
      lastUpdateBlockNumber: BigInt(event.blockNumber),
    };
  }

  context.LiquidityPool.set(currentLiquidityPool);

  context.Swap.set({
    id: event.transactionHash + event.logIndex,
    recipient: event.params.recipient,
    sender: event.params.sender,
    amount0: event.params.amount0,
    amount1: event.params.amount1,
    sqrtPriceX96: event.params.sqrtPriceX96,
    liquidity: event.params.liquidity,
    tick: event.params.tick,
    blockNumber: event.blockNumber,
    blockTimestamp: event.blockTimestamp,
    transactionHash: event.transactionHash,
    liquidityPool: event.srcAddress.toString(),
  });
});
