import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Loader2, Flame, Lock, Droplets } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { LIQUIDITY_LOCKER_ADDRESS, XTIME_ADDRESS, XTIME_PLS_LP_ADDRESS, WPLS_ADDRESS, ERC20_ABI, LIQUIDITY_LOCKER_ABI, PAIR_ABI } from '@/lib/contracts';
import { pulsechain } from '@/lib/wagmi';
import { useXTimeUsdPrice, formatUsd } from '@/hooks/useUsdPrice';
import xTimeLogo from '@/assets/xTIME.png';
import plsLogo from '@/assets/PLS.png';

const REFRESH_INTERVAL = 15_000;

const LiquidityLockerPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, address } = useAccount();
  const { writeContract } = useWriteContract();

  // Read PLS balance of the locker
  const { data: plsBalance } = useBalance({
    address: LIQUIDITY_LOCKER_ADDRESS,
  });

  // Read xTIME balance of the locker
  const { data: xTimeBalance } = useReadContract({
    address: XTIME_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [LIQUIDITY_LOCKER_ADDRESS],
    query: { refetchInterval: REFRESH_INTERVAL },
  });

  // Read LP token balance of the locker (burned LP)
  const { data: lpBalance } = useReadContract({
    address: XTIME_PLS_LP_ADDRESS,
    abi: PAIR_ABI,
    functionName: 'balanceOf',
    args: [LIQUIDITY_LOCKER_ADDRESS],
    query: { refetchInterval: REFRESH_INTERVAL },
  });

  // Read LP total supply
  const { data: lpTotalSupply } = useReadContract({
    address: XTIME_PLS_LP_ADDRESS,
    abi: PAIR_ABI,
    functionName: 'totalSupply',
    query: { refetchInterval: REFRESH_INTERVAL },
  });

  // Read LP reserves
  const { data: reserves } = useReadContract({
    address: XTIME_PLS_LP_ADDRESS,
    abi: PAIR_ABI,
    functionName: 'getReserves',
    query: { refetchInterval: REFRESH_INTERVAL },
  });

  // Read token0 to know which reserve is which
  const { data: token0 } = useReadContract({
    address: XTIME_PLS_LP_ADDRESS,
    abi: PAIR_ABI,
    functionName: 'token0',
  });

  const { usdPrice: xTimeUsd } = useXTimeUsdPrice();

  // Calculate locker's share of pool
  const lockerSharePct = lpBalance && lpTotalSupply && lpTotalSupply > 0n
    ? Number(lpBalance * 10000n / lpTotalSupply) / 100
    : 0;

  // Calculate locked liquidity in terms of PLS and xTIME
  const isToken0Wpls = token0?.toLowerCase() === WPLS_ADDRESS.toLowerCase();
  const reservePls = reserves ? (isToken0Wpls ? reserves[0] : reserves[1]) : 0n;
  const reserveXTime = reserves ? (isToken0Wpls ? reserves[1] : reserves[0]) : 0n;

  const lockedPls = lpBalance && lpTotalSupply && lpTotalSupply > 0n
    ? (BigInt(reservePls) * lpBalance) / lpTotalSupply
    : 0n;
  const lockedXTime = lpBalance && lpTotalSupply && lpTotalSupply > 0n
    ? (BigInt(reserveXTime) * lpBalance) / lpTotalSupply
    : 0n;

  const formattedPlsBalance = plsBalance ? parseFloat(formatEther(plsBalance.value)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
  const formattedXTimeBalance = xTimeBalance ? parseFloat(formatUnits(xTimeBalance, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
  const formattedLpBalance = lpBalance ? parseFloat(formatUnits(lpBalance, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0';
  const formattedLockedPls = lockedPls ? parseFloat(formatEther(lockedPls)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
  const formattedLockedXTime = lockedXTime ? parseFloat(formatUnits(lockedXTime, 18)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';

  // Total xTIME value locked (xTIME in LP + xTIME sitting in contract)
  const totalXTimeLocked = (lockedXTime || 0n) + (xTimeBalance || 0n);
  const totalXTimeLockedNum = parseFloat(formatUnits(totalXTimeLocked, 18));
  const tvlUsd = xTimeUsd ? formatUsd(totalXTimeLockedNum * 2, xTimeUsd) : '---'; // Rough: xTIME side * 2 assumes balanced pool

  const handleBoost = async () => {
    if (!isConnected || !address) return;
    setIsLoading(true);
    
    try {
      await writeContract({
        address: LIQUIDITY_LOCKER_ADDRESS,
        abi: LIQUIDITY_LOCKER_ABI,
        functionName: 'boost',
        chain: pulsechain,
        account: address,
      });
    } catch (error) {
      console.error('Boost failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasBalanceToBoost = (plsBalance?.value || 0n) > 0n || (xTimeBalance || 0n) > 0n;

  return (
    <section id="locker" className="py-12 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {/* Section header */}
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Liquidity <span className="text-cyan text-glow-cyan">Booster</span>
            </h2>
            <p className="text-sm text-muted-foreground">
              Creates LP with PLS + xTIME and burns it forever
            </p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 border border-cyan/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              {/* Pending balances */}
              <div className="grid grid-cols-2 gap-3">
                {/* PLS Balance */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={plsLogo} alt="PLS" className="w-6 h-6" />
                    <span className="text-sm text-muted-foreground">PLS</span>
                  </div>
                  <p className="font-display text-lg sm:text-xl font-bold text-foreground truncate">
                    {formattedPlsBalance}
                  </p>
                </div>

                {/* xTIME Balance */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={xTimeLogo} alt="xTIME" className="w-6 h-6" />
                    <span className="text-sm text-muted-foreground">xTIME</span>
                  </div>
                  <p className="font-display text-lg sm:text-xl font-bold text-foreground truncate">
                    {formattedXTimeBalance}
                  </p>
                </div>
              </div>

              {/* LP & Locked Stats */}
              <div className="bg-muted/20 rounded-xl p-4 border border-cyan/10 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-cyan" />
                  <span className="font-display text-sm font-semibold text-foreground">Permanently Locked</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5" /> LP Tokens
                    </span>
                    <span className="font-display font-semibold text-foreground truncate ml-2">{formattedLpBalance}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Pool Share</span>
                    <span className="font-display font-semibold text-cyan">{lockerSharePct.toFixed(2)}%</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">PLS in LP</p>
                    <p className="font-display font-semibold text-foreground truncate">{formattedLockedPls}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">xTIME in LP</p>
                    <p className="font-display font-semibold text-foreground truncate">{formattedLockedXTime}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Est. Value Locked</span>
                    <span className="font-display font-bold text-primary text-lg">{tvlUsd}</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-magenta/5 border border-magenta/20">
                <Flame className="w-5 h-5 text-magenta flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Calling boost() creates LP from these balances and sends it to the zero address — permanently locked forever.
                </p>
              </div>

              {/* Boost Button */}
              <button
                onClick={handleBoost}
                disabled={!isConnected || isLoading || !hasBalanceToBoost}
                className="w-full py-4 rounded-xl font-display font-bold text-base sm:text-lg bg-gradient-to-r from-cyan to-cyan-glow text-secondary-foreground hover:shadow-xl hover:shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Boosting...
                  </>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !hasBalanceToBoost ? (
                  'No Balance to Boost'
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Boost Liquidity
                  </>
                )}
              </button>

              {/* Contract link */}
              <a 
                href={`https://scan.pulsechain.com/address/${LIQUIDITY_LOCKER_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs text-muted-foreground hover:text-cyan transition-colors"
              >
                View contract on PulseScan ↗
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LiquidityLockerPanel;
