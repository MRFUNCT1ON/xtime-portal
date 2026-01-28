import { useReadContract, useAccount, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { XTIME_ADDRESS, WPLS_ADDRESS, PULSEX_ROUTER_ADDRESS, PULSEX_ROUTER_ABI } from '@/lib/contracts';

const REFRESH_INTERVAL = 15_000;

// Get quote for swapping PLS to xTIME (buying)
export function useSwapPlsToXTime(plsAmount: string) {
  const amountWei = plsAmount && parseFloat(plsAmount) > 0 
    ? parseUnits(plsAmount, 18) 
    : BigInt(0);

  const { data, isLoading, error } = useReadContract({
    address: PULSEX_ROUTER_ADDRESS,
    abi: PULSEX_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [amountWei, [WPLS_ADDRESS, XTIME_ADDRESS]],
    query: { 
      enabled: amountWei > BigInt(0),
      refetchInterval: REFRESH_INTERVAL,
    },
  });

  // The last element is the xTIME output
  const xTimeOut = data && data.length > 1 ? formatUnits(data[data.length - 1], 18) : '0';

  return {
    xTimeOut,
    xTimeOutRaw: data ? data[data.length - 1] : BigInt(0),
    isLoading,
    error,
  };
}

// Get quote for swapping xTIME to PLS (selling)
export function useSwapXTimeToPls(xTimeAmount: string) {
  const amountWei = xTimeAmount && parseFloat(xTimeAmount) > 0 
    ? parseUnits(xTimeAmount, 18) 
    : BigInt(0);

  const { data, isLoading, error } = useReadContract({
    address: PULSEX_ROUTER_ADDRESS,
    abi: PULSEX_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [amountWei, [XTIME_ADDRESS, WPLS_ADDRESS]],
    query: { 
      enabled: amountWei > BigInt(0),
      refetchInterval: REFRESH_INTERVAL,
    },
  });

  // The last element is the PLS output
  const plsOut = data && data.length > 1 ? formatUnits(data[data.length - 1], 18) : '0';

  return {
    plsOut,
    plsOutRaw: data ? data[data.length - 1] : BigInt(0),
    isLoading,
    error,
  };
}

// Get user's PLS balance
export function usePlsBalance() {
  const { address } = useAccount();
  
  const { data, isLoading, refetch } = useBalance({
    address,
    query: { 
      enabled: !!address,
      refetchInterval: REFRESH_INTERVAL,
    },
  });

  return {
    plsBalance: data ? formatUnits(data.value, 18) : '0',
    plsBalanceRaw: data?.value ?? BigInt(0),
    isLoading,
    refetch,
  };
}

// Get xTIME price in PLS (for 1 xTIME)
export function useXTimePlsPrice() {
  const oneXTime = parseUnits('1', 18);
  
  const { data, isLoading, error } = useReadContract({
    address: PULSEX_ROUTER_ADDRESS,
    abi: PULSEX_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [oneXTime, [XTIME_ADDRESS, WPLS_ADDRESS]],
    query: { refetchInterval: REFRESH_INTERVAL },
  });

  const plsPrice = data && data.length > 1 ? parseFloat(formatUnits(data[data.length - 1], 18)) : null;

  return { plsPrice, isLoading, error };
}

// Get PLS price in xTIME (for 1 PLS, how much xTIME)
export function usePlsXTimePrice() {
  const onePls = parseUnits('1', 18);
  
  const { data, isLoading, error } = useReadContract({
    address: PULSEX_ROUTER_ADDRESS,
    abi: PULSEX_ROUTER_ABI,
    functionName: 'getAmountsOut',
    args: [onePls, [WPLS_ADDRESS, XTIME_ADDRESS]],
    query: { refetchInterval: REFRESH_INTERVAL },
  });

  const xTimePrice = data && data.length > 1 ? parseFloat(formatUnits(data[data.length - 1], 18)) : null;

  return { xTimePrice, isLoading, error };
}
