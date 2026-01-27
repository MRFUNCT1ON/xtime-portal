import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket, Loader2, Flame } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useBalance, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { LIQUIDITY_LOCKER_ADDRESS, XTIME_ADDRESS, ERC20_ABI, LIQUIDITY_LOCKER_ABI } from '@/lib/contracts';
import { pulsechain } from '@/lib/wagmi';
import xTimeLogo from '@/assets/xTIME.png';
import plsLogo from '@/assets/PLS.png';

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
  });

  const formattedPlsBalance = plsBalance ? parseFloat(formatEther(plsBalance.value)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';
  const formattedXTimeBalance = xTimeBalance ? parseFloat(formatEther(xTimeBalance)).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';

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
              {/* Balance display */}
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
