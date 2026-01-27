import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownUp, Loader2, Info } from 'lucide-react';
import { useAccount } from 'wagmi';
import timeLogo from '@/assets/TIME.png';
import xTimeLogo from '@/assets/xTIME.png';

type TabType = 'mint' | 'redeem';

const MintRedeemCard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('mint');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useAccount();

  // Mock data - replace with actual contract reads
  const currentPrice = '1.0523';
  const estimatedOutput = amount ? (parseFloat(amount) * 0.95).toFixed(4) : '0.0000';

  const handleMaxClick = () => {
    // Replace with actual balance fetch
    setAmount('1000');
  };

  const handleSubmit = async () => {
    if (!amount || !isConnected) return;
    setIsLoading(true);
    // Add actual transaction logic here
    setTimeout(() => setIsLoading(false), 2000);
  };

  const inputToken = activeTab === 'mint' ? { symbol: 'TIME', logo: timeLogo } : { symbol: 'xTIME', logo: xTimeLogo };
  const outputToken = activeTab === 'mint' ? { symbol: 'xTIME', logo: xTimeLogo } : { symbol: 'TIME', logo: timeLogo };

  return (
    <section id="mint" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {/* Price indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Current Price:</span>
            <span className="font-display text-lg font-bold text-primary text-glow-gold pulse-gold px-3 py-1 rounded-lg bg-primary/10">
              1 xTIME = {currentPrice} TIME
            </span>
          </div>

          {/* Card */}
          <div className="neon-border rounded-2xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute inset-0 shimmer pointer-events-none" />
            
            {/* Tabs */}
            <div className="flex rounded-xl bg-muted/50 p-1 mb-6 relative z-10">
              {(['mint', 'redeem'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-lg font-display font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-primary to-gold-glow text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'mint' ? 'Mint xTIME' : 'Redeem TIME'}
                </button>
              ))}
            </div>

            {/* Input Section */}
            <div className="relative z-10 space-y-4">
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">You pay</span>
                  <button 
                    onClick={handleMaxClick}
                    className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    MAX
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 min-w-0 bg-transparent text-2xl sm:text-3xl font-display font-bold text-foreground outline-none placeholder:text-muted-foreground/50"
                  />
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border flex-shrink-0">
                    <img src={inputToken.logo} alt={inputToken.symbol} className="w-6 h-6" />
                    <span className="font-display font-semibold text-sm">{inputToken.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Swap Icon */}
              <div className="flex justify-center -my-2 relative z-20">
                <button 
                  onClick={() => setActiveTab(activeTab === 'mint' ? 'redeem' : 'mint')}
                  className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group"
                >
                  <ArrowDownUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </div>

              {/* Output Section */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">You receive (after 5% fee)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex-1 min-w-0 text-2xl sm:text-3xl font-display font-bold text-foreground truncate">
                    {estimatedOutput}
                  </span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border flex-shrink-0">
                    <img src={outputToken.logo} alt={outputToken.symbol} className="w-6 h-6" />
                    <span className="font-display font-semibold text-sm">{outputToken.symbol}</span>
                  </div>
                </div>
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-cyan/5 border border-cyan/20">
                <Info className="w-5 h-5 text-cyan flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {activeTab === 'mint' 
                    ? 'Minting xTIME locks your TIME tokens. The xTIME price only goes up — any arbitrage gap benefits all holders.'
                    : 'Redeeming burns your xTIME and returns TIME tokens minus the 5% fee.'
                  }
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isConnected || !amount || isLoading}
                className="w-full py-4 rounded-xl font-display font-bold text-base sm:text-lg bg-gradient-to-r from-primary to-gold-glow text-primary-foreground hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : !amount ? (
                  'Enter Amount'
                ) : activeTab === 'mint' ? (
                  'Mint xTIME'
                ) : (
                  'Redeem TIME'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MintRedeemCard;
