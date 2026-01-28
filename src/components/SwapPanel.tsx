import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Loader2, Info, CheckCircle2 } from 'lucide-react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import xTimeLogo from '@/assets/xTIME.png';
import plsLogo from '@/assets/PLS.png';
import { useSwapPlsToXTime, useSwapXTimeToPls, usePlsBalance, useXTimePlsPrice } from '@/hooks/useSwapData';
import { useTokenBalances } from '@/hooks/useXTimeData';
import { useXTimeUsdPrice } from '@/hooks/useUsdPrice';
import { PULSEX_ROUTER_ADDRESS, PULSEX_ROUTER_ABI, XTIME_ADDRESS, WPLS_ADDRESS, ERC20_ABI } from '@/lib/contracts';
import { pulsechain } from '@/lib/wagmi';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type SwapDirection = 'buy' | 'sell';
type TxState = 'idle' | 'approving' | 'pending' | 'success' | 'error';

const SwapPanel = () => {
  const [direction, setDirection] = useState<SwapDirection>('buy');
  const [amount, setAmount] = useState('');
  const [txState, setTxState] = useState<TxState>('idle');
  const [slippage] = useState(1); // 1% slippage
  const { isConnected, address } = useAccount();
  const { writeContract, data: txHash, reset: resetWrite } = useWriteContract();
  const { toast } = useToast();

  // Balances
  const { plsBalance, plsBalanceRaw, refetch: refetchPls } = usePlsBalance();
  const { xTimeBalance, xTimeBalanceRaw, refetch: refetchTokens } = useTokenBalances();
  
  // Price data
  const { plsPrice: xTimeInPls, isLoading: priceLoading } = useXTimePlsPrice();
  const { usdPrice: xTimeUsd } = useXTimeUsdPrice();
  
  // Swap quotes
  const { xTimeOut, xTimeOutRaw } = useSwapPlsToXTime(direction === 'buy' ? amount : '0');
  const { plsOut, plsOutRaw } = useSwapXTimeToPls(direction === 'sell' ? amount : '0');

  // xTIME allowance for router
  const { data: xTimeAllowance, refetch: refetchAllowance } = useReadContract({
    address: XTIME_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address ? [address, PULSEX_ROUTER_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // Wait for transaction
  const { isLoading: isTxPending, isSuccess: isTxSuccess, isError: isTxError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction state changes
  useEffect(() => {
    if (isTxPending && txState !== 'approving') {
      setTxState('pending');
    }
    if (isTxSuccess) {
      if (txState === 'approving') {
        refetchAllowance();
        toast({
          title: "Approval Successful",
          description: "xTIME approved for swap. Now executing swap...",
        });
        executeSwap();
      } else {
        setTxState('success');
        setAmount('');
        refetchPls();
        refetchTokens();
        toast({
          title: "Swap Successful!",
          description: direction === 'buy' ? "You bought xTIME!" : "You sold xTIME for PLS!",
        });
        setTimeout(() => {
          setTxState('idle');
          resetWrite();
        }, 2000);
      }
    }
    if (isTxError) {
      setTxState('error');
      toast({
        title: "Swap Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setTimeout(() => {
        setTxState('idle');
        resetWrite();
      }, 2000);
    }
  }, [isTxPending, isTxSuccess, isTxError]);

  const amountWei = amount && parseFloat(amount) > 0 ? parseUnits(amount, 18) : 0n;
  const needsApproval = direction === 'sell' && xTimeAllowance !== undefined && amountWei > xTimeAllowance;
  const hasInsufficientBalance = direction === 'buy' 
    ? amountWei > plsBalanceRaw 
    : amountWei > xTimeBalanceRaw;

  const handleMaxClick = () => {
    if (direction === 'buy') {
      // Leave some PLS for gas
      const maxPls = plsBalanceRaw > parseUnits('10', 18) 
        ? formatUnits(plsBalanceRaw - parseUnits('10', 18), 18)
        : '0';
      setAmount(maxPls);
    } else {
      setAmount(xTimeBalance);
    }
  };

  const executeSwap = async () => {
    if (!address || !amount) return;
    
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200); // 20 min deadline
    const slippageMultiplier = (100 - slippage) / 100;
    
    try {
      if (direction === 'buy') {
        // Buy xTIME with PLS
        const minOut = BigInt(Math.floor(Number(xTimeOutRaw) * slippageMultiplier));
        await writeContract({
          address: PULSEX_ROUTER_ADDRESS,
          abi: PULSEX_ROUTER_ABI,
          functionName: 'swapExactETHForTokens',
          args: [minOut, [WPLS_ADDRESS, XTIME_ADDRESS], address, deadline],
          value: amountWei,
          chain: pulsechain,
          account: address,
        });
      } else {
        // Sell xTIME for PLS
        const minOut = BigInt(Math.floor(Number(plsOutRaw) * slippageMultiplier));
        await writeContract({
          address: PULSEX_ROUTER_ADDRESS,
          abi: PULSEX_ROUTER_ABI,
          functionName: 'swapExactTokensForETH',
          args: [amountWei, minOut, [XTIME_ADDRESS, WPLS_ADDRESS], address, deadline],
          chain: pulsechain,
          account: address,
        });
      }
    } catch (error: any) {
      console.error('Swap failed:', error);
      setTxState('error');
      toast({
        title: "Transaction Rejected",
        description: error?.shortMessage || "User rejected the transaction.",
        variant: "destructive",
      });
      setTimeout(() => setTxState('idle'), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !isConnected || !address || hasInsufficientBalance) return;
    
    try {
      if (direction === 'sell' && needsApproval) {
        setTxState('approving');
        toast({
          title: "Approval Required",
          description: "Please approve xTIME for swap.",
        });
        await writeContract({
          address: XTIME_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [PULSEX_ROUTER_ADDRESS, amountWei],
          chain: pulsechain,
          account: address,
        });
      } else {
        setTxState('pending');
        await executeSwap();
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setTxState('error');
      toast({
        title: "Transaction Rejected",
        description: error?.shortMessage || "User rejected the transaction.",
        variant: "destructive",
      });
      setTimeout(() => setTxState('idle'), 2000);
    }
  };

  const inputToken = direction === 'buy' 
    ? { symbol: 'PLS', logo: plsLogo } 
    : { symbol: 'xTIME', logo: xTimeLogo };
  const outputToken = direction === 'buy' 
    ? { symbol: 'xTIME', logo: xTimeLogo } 
    : { symbol: 'PLS', logo: plsLogo };
  const inputBalance = direction === 'buy' ? plsBalance : xTimeBalance;
  const estimatedOutput = direction === 'buy' ? xTimeOut : plsOut;

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const getButtonText = () => {
    if (txState === 'approving') return <><Loader2 className="w-4 h-4 animate-spin" /> Approving...</>;
    if (txState === 'pending') return <><Loader2 className="w-4 h-4 animate-spin" /> Swapping...</>;
    if (txState === 'success') return <><CheckCircle2 className="w-4 h-4" /> Success!</>;
    if (!isConnected) return 'Connect Wallet';
    if (!amount) return 'Enter Amount';
    if (hasInsufficientBalance) return 'Insufficient Balance';
    if (needsApproval) return 'Approve & Swap';
    return direction === 'buy' ? 'Buy xTIME' : 'Sell xTIME';
  };

  const isButtonDisabled = !isConnected || !amount || txState !== 'idle' || hasInsufficientBalance;

  return (
    <section id="swap" className="py-8 sm:py-12 relative">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2 text-glow-gold">
            Buy / Sell
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Trade xTIME on PulseX — no minting fee, instant execution
          </p>
        </div>

        {/* DEX Price indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">DEX Price:</span>
          {priceLoading ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <span className="font-display text-base font-bold text-cyan text-glow-cyan px-3 py-1 rounded-lg bg-cyan/10">
              1 xTIME = {xTimeInPls ? formatNumber(xTimeInPls) : '---'} PLS
            </span>
          )}
        </div>

        <div className="max-w-xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="neon-border-cyan rounded-2xl p-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 shimmer pointer-events-none" />
            
            {/* Tabs */}
            <div className="flex rounded-xl bg-muted/50 p-1 mb-4 relative z-10">
              {(['buy', 'sell'] as SwapDirection[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setDirection(tab); setAmount(''); }}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-display font-semibold text-sm transition-all duration-300 ${
                    direction === tab
                      ? 'bg-gradient-to-r from-cyan to-cyan-glow text-secondary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'buy' ? 'Buy xTIME' : 'Sell xTIME'}
                </button>
              ))}
            </div>

            {/* Input/Output */}
            <div className="relative z-10 space-y-3">
              <div className="bg-muted/30 rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">You pay</span>
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <span className="text-xs text-muted-foreground">
                        Bal: {formatNumber(inputBalance)}
                      </span>
                    )}
                    <button onClick={handleMaxClick} className="text-xs text-cyan hover:text-cyan/80 font-medium">MAX</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 min-w-0 bg-transparent text-xl sm:text-2xl font-display font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/50 border border-border flex-shrink-0">
                    <img src={inputToken.logo} alt={inputToken.symbol} className="w-5 h-5" />
                    <span className="font-display font-semibold text-xs">{inputToken.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center -my-1 relative z-20">
                <button 
                  onClick={() => { setDirection(direction === 'buy' ? 'sell' : 'buy'); setAmount(''); }}
                  className="p-2 rounded-lg bg-card border border-border hover:border-cyan/50 hover:bg-cyan/10 transition-all"
                >
                  <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="bg-muted/30 rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">You receive (est.)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 text-xl sm:text-2xl font-display font-bold text-foreground truncate">
                    {parseFloat(estimatedOutput).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/50 border border-border flex-shrink-0">
                    <img src={outputToken.logo} alt={outputToken.symbol} className="w-5 h-5" />
                    <span className="font-display font-semibold text-xs">{outputToken.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan/5 border border-cyan/20">
                <Info className="w-4 h-4 text-cyan flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  {direction === 'buy' 
                    ? `No minting fee! DEX price may differ from mint price — check for arbitrage.`
                    : `Selling on DEX has no redeem fee. Slippage set to ${slippage}%.`
                  }
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isButtonDisabled}
                className={`w-full py-3 rounded-xl font-display font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  txState === 'success' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gradient-to-r from-cyan to-cyan-glow text-secondary-foreground hover:shadow-xl hover:shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {getButtonText()}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SwapPanel;
