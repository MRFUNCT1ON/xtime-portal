import { useReadContract, useReadContracts, useAccount, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { XTIME_ADDRESS, TIME_ADDRESS, XTIME_ABI, ERC20_ABI } from '@/lib/contracts';

// Hook to get xTIME protocol info (users, txs, supply, backing, price)
export function useXTimeInfo() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'getInfo',
  });

  const formatted = data ? {
    users: Number(data[0]),
    transactions: Number(data[1]),
    underlyingSupply: formatUnits(data[2], 18),
    totalSupply: formatUnits(data[3], 18),
    price: formatUnits(data[4], 18),
  } : null;

  return { data: formatted, isLoading, error, refetch };
}

// Hook to get current xTIME price
export function useXTimePrice() {
  const { data, isLoading, error } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'calculatePrice',
  });

  return {
    price: data ? formatUnits(data, 18) : null,
    isLoading,
    error,
  };
}

// Hook to get user's TIME and xTIME balances
export function useTokenBalances() {
  const { address } = useAccount();

  const { data: timeBalance, isLoading: timeLoading, refetch: refetchTime } = useReadContract({
    address: TIME_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: xTimeBalance, isLoading: xTimeLoading, refetch: refetchXTime } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    timeBalance: timeBalance ? formatUnits(timeBalance, 18) : '0',
    xTimeBalance: xTimeBalance ? formatUnits(xTimeBalance, 18) : '0',
    timeBalanceRaw: timeBalance ?? BigInt(0),
    xTimeBalanceRaw: xTimeBalance ?? BigInt(0),
    isLoading: timeLoading || xTimeLoading,
    refetch: () => {
      refetchTime();
      refetchXTime();
    },
  };
}

// Hook to estimate minted xTIME from TIME input
export function useEstimateMinted(timeAmount: string) {
  const amountWei = timeAmount && parseFloat(timeAmount) > 0 
    ? parseUnits(timeAmount, 18) 
    : BigInt(0);

  const { data, isLoading } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'estimateMinted',
    args: [amountWei],
    query: { enabled: amountWei > BigInt(0) },
  });

  return {
    estimatedXTime: data ? formatUnits(data, 18) : '0',
    isLoading,
  };
}

// Hook to estimate redeemed TIME from xTIME input
export function useEstimateRedeemed(xTimeAmount: string) {
  const amountWei = xTimeAmount && parseFloat(xTimeAmount) > 0 
    ? parseUnits(xTimeAmount, 18) 
    : BigInt(0);

  const { data, isLoading } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'estimateRedeemed',
    args: [amountWei],
    query: { enabled: amountWei > BigInt(0) },
  });

  return {
    estimatedTime: data ? formatUnits(data, 18) : '0',
    isLoading,
  };
}

// Hook to get TIME allowance for xTIME contract
export function useTimeAllowance() {
  const { address } = useAccount();

  const { data, isLoading, refetch } = useReadContract({
    address: TIME_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, XTIME_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  return {
    allowance: data ?? BigInt(0),
    allowanceFormatted: data ? formatUnits(data, 18) : '0',
    isLoading,
    refetch,
  };
}

// Hook to get user's xTIME holdings value in TIME
export function useHoldingsValue() {
  const { address } = useAccount();

  const { data, isLoading } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'getValueOfHoldings',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  return {
    valueInTime: data ? formatUnits(data, 18) : '0',
    isLoading,
  };
}

// Hook to get mint and sell fees
export function useXTimeFees() {
  const { data: mintFee } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'mintFee',
  });

  const { data: sellFee } = useReadContract({
    address: XTIME_ADDRESS,
    abi: XTIME_ABI,
    functionName: 'sellFee',
  });

  return {
    mintFee: mintFee ? Number(mintFee) / 100 : 5, // Convert basis points to percentage
    sellFee: sellFee ? Number(sellFee) / 100 : 5,
  };
}
