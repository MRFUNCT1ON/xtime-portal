import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpDown, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { ARBITRAGE_ADDRESS, ARBITRAGE_ABI } from '@/lib/contracts';
import { pulsechain } from '@/lib/wagmi';
import { toast } from '@/hooks/use-toast';

const ArbitragePanel = () => {
  const [plsAmount, setPlsAmount] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: plsBalance } = useBalance({ address });

  // Read getBestMove from contract
  const { data: bestMove, isLoading: isLoadingBestMove, refetch: refetchBestMove } = useReadContract({
    address: ARBITRAGE_ADDRESS,
    abi: ARBITRAGE_ABI,
    functionName: 'getBestMove',
  });

  // Read paused state
  const { data: isPaused } = useReadContract({
    address: ARBITRAGE_ADDRESS,
    abi: ARBITRAGE_ABI,
    functionName: 'paused',
  });

  const { writeContract, data: txHash, isPending, reset: resetWrite } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  // Handle transaction state changes
  useEffect(() => {
    if (isSuccess && isExecuting) {
      setIsExecuting(false);
      toast({
        title: 'Arbitrage Executed!',
        description: 'Your transaction was successful.',
      });
      refetchBestMove();
      setPlsAmount('');
      setTimeout(() => resetWrite(), 2000);
    }
    if (isError && isExecuting) {
      setIsExecuting(false);
      toast({
        title: 'Transaction Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setTimeout(() => resetWrite(), 2000);
    }
  }, [isSuccess, isError, isExecuting]);

  const handleExecute = async (functionId: string) => {
    if (!address) return;
    
    if (!plsAmount || parseFloat(plsAmount) <= 0) {
      toast({
        title: 'Enter Amount',
        description: 'Please enter a PLS amount to use for arbitrage.',
        variant: 'destructive',
      });
      return;
    }

    const minProfitBps = BigInt(0); // Accept any profit
    const value = parseEther(plsAmount);

    setIsExecuting(true);

    try {
      if (functionId === 'fing') {
        writeContract({
          address: ARBITRAGE_ADDRESS,
          abi: ARBITRAGE_ABI,
          functionName: 'fing',
          args: [minProfitBps],
          value,
          chain: pulsechain,
          account: address,
        });
      } else if (functionId === 'fong') {
        writeContract({
          address: ARBITRAGE_ADDRESS,
          abi: ARBITRAGE_ABI,
          functionName: 'fong',
          args: [minProfitBps],
          value,
          chain: pulsechain,
          account: address,
        });
      }
    } catch (error: any) {
      setIsExecuting(false);
      toast({
        title: 'Transaction Failed',
        description: error.message?.includes('User rejected') 
          ? 'Transaction was rejected' 
          : 'Failed to execute transaction',
        variant: 'destructive',
      });
    }
  };

  const handleMaxClick = () => {
    if (plsBalance) {
      // Leave some for gas
      const maxAmount = parseFloat(formatEther(plsBalance.value)) - 100;
      if (maxAmount > 0) {
        setPlsAmount(maxAmount.toFixed(2));
      }
    }
  };

  const isButtonDisabled = isPending || isConfirming || !isConnected || isPaused;

  return (
    <section id="arbitrage" className="py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ArrowUpDown className="w-6 h-6 text-primary" />
                <CardTitle className="font-display text-2xl text-glow-gold">
                  Arbitrage Mechanism
                </CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Balance mint/redeem and DEX prices to earn profits
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Best Move Readout */}
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Current Opportunity
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetchBestMove()}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {isLoadingBestMove ? (
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : bestMove ? (
                  <div className="space-y-2">
                    <p className="text-lg font-display font-bold text-primary">
                      {bestMove.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bestMove.description}
                    </p>
                    {bestMove.functionId && bestMove.functionId !== 'none' && (
                      <p className="text-xs text-muted-foreground/70">
                        Recommended: <code className="bg-muted px-1 rounded">{bestMove.functionId}()</code>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unable to fetch opportunity</p>
                )}
              </div>

              {/* Paused Warning */}
              {isPaused && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Arbitrage contract is currently paused</span>
                </div>
              )}

              {/* PLS Amount Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  PLS Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={plsAmount}
                    onChange={(e) => setPlsAmount(e.target.value)}
                    className="pr-20 bg-muted/50 border-border focus:border-primary"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMaxClick}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 text-xs text-primary hover:text-primary/80"
                  >
                    MAX
                  </Button>
                </div>
                {plsBalance && (
                  <p className="text-xs text-muted-foreground">
                    Balance: {parseFloat(formatEther(plsBalance.value)).toLocaleString(undefined, { maximumFractionDigits: 2 })} PLS
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleExecute('fing')}
                  disabled={isButtonDisabled || !plsAmount}
                  className="w-full py-6 font-display text-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                >
                  {isPending || isConfirming ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Fing
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleExecute('fong')}
                  disabled={isButtonDisabled || !plsAmount}
                  className="w-full py-6 font-display text-lg bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                >
                  {isPending || isConfirming ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Fong
                    </>
                  )}
                </Button>
              </div>

              {/* Info */}
              <div className="text-xs text-center text-muted-foreground space-y-1">
                <p><strong>Fing:</strong> Mint xTIME with TIME, then sell on DEX</p>
                <p><strong>Fong:</strong> Buy xTIME on DEX, then redeem for TIME</p>
                <p className="pt-2 text-muted-foreground/70">
                  These functions help balance prices between mint/redeem and DEX trading
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ArbitragePanel;
