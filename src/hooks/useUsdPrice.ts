import { useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

// Token addresses for price path
const XTIME_ADDRESS = '0xdcE001f55DA9c00c438d4129c6f02000b818e792' as const;
const TIME_ADDRESS = '0xCA35638A3fdDD02fEC597D8c1681198C06b23F58' as const;
const WPLS_ADDRESS = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27' as const;
const DAI_ADDRESS = '0xefD766cCb38EaF1dfd701853BFCe31359239F305' as const;
const PULSEX_ROUTER_ADDRESS = '0x165C3410fC91EF562C50559f7d2289fEbed552d9' as const;

const ROUTER_ABI = [
  {
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'path', type: 'address[]' },
    ],
    name: 'getAmountsOut',
    outputs: [{ name: 'amounts', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Refresh interval for price data (15 seconds)
const PRICE_REFRESH_INTERVAL = 15_000;

// Get USD price for 1 xTIME via xTIME > TIME > WPLS > DAI path
export function useXTimeUsdPrice() {
  const oneXTime = parseUnits('1', 18);
  
  const { data, isLoading, error } = useReadContract({
    address: PULSEX_ROUTER_ADDRESS,
    abi: ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [oneXTime, [XTIME_ADDRESS, TIME_ADDRESS, WPLS_ADDRESS, DAI_ADDRESS]],
    query: { refetchInterval: PRICE_REFRESH_INTERVAL },
  });

  // DAI has 18 decimals, the last element is the DAI output
  const usdPrice = data ? parseFloat(formatUnits(data[data.length - 1], 18)) : null;

  return { usdPrice, isLoading, error };
}

// Get USD price for 1 TIME via TIME > WPLS > DAI path
export function useTimeUsdPrice() {
  const oneTime = parseUnits('1', 18);
  
  const { data, isLoading, error } = useReadContract({
    address: PULSEX_ROUTER_ADDRESS,
    abi: ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [oneTime, [TIME_ADDRESS, WPLS_ADDRESS, DAI_ADDRESS]],
    query: { refetchInterval: PRICE_REFRESH_INTERVAL },
  });

  const usdPrice = data ? parseFloat(formatUnits(data[data.length - 1], 18)) : null;

  return { usdPrice, isLoading, error };
}

// Calculate USD value of a token amount
export function formatUsd(amount: string | number, price: number | null): string {
  if (!price) return '---';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount) || numAmount === 0) return '$0.00';
  const value = numAmount * price;
  if (value < 0.01) return '<$0.01';
  if (value < 1000) return `$${value.toFixed(2)}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
