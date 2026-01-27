import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Loader2, Info, Rocket, Flame, TrendingUp, Users, ArrowRightLeft, Coins } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useBalance } from 'wagmi';
import { formatEther } from 'viem';
import timeLogo from '@/assets/TIME.png';
import xTimeLogo from '@/assets/xTIME.png';
import plsLogo from '@/assets/PLS.png';
import { useXTimePrice, useTokenBalances, useEstimateMinted, useEstimateRedeemed, useXTimeFees, useXTimeInfo } from '@/hooks/useXTimeData';
import { LIQUIDITY_LOCKER_ADDRESS, XTIME_ADDRESS, ERC20_ABI, LIQUIDITY_LOCKER_ABI } from '@/lib/contracts';
import { pulsechain } from '@/lib/wagmi';
import { Skeleton } from '@/components/ui/skeleton';

type TabType = 'mint' | 'redeem';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('mint');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBoostLoading, setIsBoostLoading] = useState(false);
  const { isConnected, address } = useAccount();
  const { writeContract } = useWriteContract();

  // Live contract reads
  const { price, isLoading: priceLoading } = useXTimePrice();
  const { timeBalance, xTimeBalance } = useTokenBalances();
  const { estimatedXTime } = useEstimateMinted(activeTab === 'mint' ? amount : '0');
  const { estimatedTime } = useEstimateRedeemed(activeTab === 'redeem' ? amount : '0');
  const { mintFee, sellFee } = useXTimeFees();
  const { data: statsData, isLoading: statsLoading } = useXTimeInfo();

  // Liquidity locker reads
  const { data: plsBalance } = useBalance({ address: LIQUIDITY_LOCKER_ADDRESS });
  const { data: lockerXTimeBalance } = useReadContract({
    address: XTIME_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [LIQUIDITY_LOCKER_ADDRESS],
  });

  const currentPrice = price ? parseFloat(price).toFixed(4) : '---';
  const estimatedOutput = activeTab === 'mint' ? estimatedXTime : estimatedTime;
  const currentFee = activeTab === 'mint' ? mintFee : sellFee;
  const formattedPlsBalance = plsBalance ? parseFloat(formatEther(plsBalance.value)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';
  const formattedLockerXTimeBalance = lockerXTimeBalance ? parseFloat(formatEther(lockerXTimeBalance)).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';
  const hasBalanceToBoost = (plsBalance?.value || 0n) > 0n || (lockerXTimeBalance || 0n) > 0n;

  const handleMaxClick = () => {
    const balance = activeTab === 'mint' ? timeBalance : xTimeBalance;
    setAmount(balance);
  };

  const handleSubmit = async () => {
    if (!amount || !isConnected) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleBoost = async () => {
    if (!isConnected || !address) return;
    setIsBoostLoading(true);
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
      setIsBoostLoading(false);
    }
  };

  const inputToken = activeTab === 'mint' ? { symbol: 'TIME', logo: timeLogo } : { symbol: 'xTIME', logo: xTimeLogo };
  const outputToken = activeTab === 'mint' ? { symbol: 'xTIME', logo: xTimeLogo } : { symbol: 'TIME', logo: timeLogo };
  const inputBalance = activeTab === 'mint' ? timeBalance : xTimeBalance;

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseFloat(num) : num;
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <section id="dashboard" className="py-8 sm:py-12 relative">
      <div className="container mx-auto px-4">
        {/* Price indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-sm text-muted-foreground">Current Price:</span>
          {priceLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <span className="font-display text-base font-bold text-primary text-glow-gold px-3 py-1 rounded-lg bg-primary/10">
              1 xTIME = {currentPrice} TIME
            </span>
          )}
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Mint/Redeem Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 neon-border rounded-2xl p-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 shimmer pointer-events-none" />
            
            {/* Tabs */}
            <div className="flex rounded-xl bg-muted/50 p-1 mb-4 relative z-10">
              {(['mint', 'redeem'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 px-3 rounded-lg font-display font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-primary to-gold-glow text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'mint' ? 'Mint xTIME' : 'Redeem TIME'}
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
                        Bal: {parseFloat(inputBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </span>
                    )}
                    <button onClick={handleMaxClick} className="text-xs text-primary hover:text-primary/80 font-medium">MAX</button>
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
                  onClick={() => setActiveTab(activeTab === 'mint' ? 'redeem' : 'mint')}
                  className="p-2 rounded-lg bg-card border border-border hover:border-primary/50 hover:bg-primary/10 transition-all"
                >
                  <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="bg-muted/30 rounded-xl p-3 border border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted-foreground">You receive (after {currentFee}% fee)</span>
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
                  {activeTab === 'mint' 
                    ? `Minting locks TIME. xTIME price only goes up — arbitrage benefits all holders.`
                    : `Redeeming burns xTIME and returns TIME minus ${sellFee}% fee.`
                  }
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!isConnected || !amount || isLoading}
                className="w-full py-3 rounded-xl font-display font-bold text-sm bg-gradient-to-r from-primary to-gold-glow text-primary-foreground hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : !isConnected ? 'Connect Wallet' : !amount ? 'Enter Amount' : activeTab === 'mint' ? 'Mint xTIME' : 'Redeem TIME'}
              </button>
            </div>
          </motion.div>

          {/* Right Column: Boost + Stats */}
          <div className="space-y-4">
            {/* Boost Panel */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-4 border border-cyan/20 relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-cyan/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-cyan" />
                  <span className="font-display font-semibold text-sm">Liquidity Booster</span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <img src={plsLogo} alt="PLS" className="w-4 h-4" />
                      <span className="text-xs text-muted-foreground">PLS</span>
                    </div>
                    <p className="font-display text-sm font-bold truncate">{formattedPlsBalance}</p>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                    <div className="flex items-center gap-1.5 mb-1">
                      <img src={xTimeLogo} alt="xTIME" className="w-4 h-4" />
                      <span className="text-xs text-muted-foreground">xTIME</span>
                    </div>
                    <p className="font-display text-sm font-bold truncate">{formattedLockerXTimeBalance}</p>
                  </div>
                </div>

                <button
                  onClick={handleBoost}
                  disabled={!isConnected || isBoostLoading || !hasBalanceToBoost}
                  className="w-full py-2.5 rounded-lg font-display font-bold text-sm bg-gradient-to-r from-cyan to-cyan-glow text-secondary-foreground hover:shadow-lg hover:shadow-cyan/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isBoostLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Boosting...</>
                  ) : !isConnected ? 'Connect Wallet' : !hasBalanceToBoost ? 'No Balance' : (
                    <><Rocket className="w-4 h-4" /> Boost</>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-4 border border-border"
            >
              <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Protocol Stats
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">Holders</p>
                  {statsLoading ? <Skeleton className="h-5 w-12" /> : (
                    <p className="font-display text-sm font-bold">{statsData ? formatNumber(statsData.users) : '---'}</p>
                  )}
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">Transactions</p>
                  {statsLoading ? <Skeleton className="h-5 w-12" /> : (
                    <p className="font-display text-sm font-bold">{statsData ? formatNumber(statsData.transactions) : '---'}</p>
                  )}
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">xTIME Supply</p>
                  {statsLoading ? <Skeleton className="h-5 w-16" /> : (
                    <p className="font-display text-sm font-bold">{statsData ? formatNumber(statsData.totalSupply) : '---'}</p>
                  )}
                </div>
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border">
                  <p className="text-xs text-muted-foreground mb-0.5">TIME Locked</p>
                  {statsLoading ? <Skeleton className="h-5 w-16" /> : (
                    <p className="font-display text-sm font-bold text-primary">{statsData ? formatNumber(statsData.underlyingSupply) : '---'}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
