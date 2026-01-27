import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, Shield, Zap } from 'lucide-react';
import xTimeLogo from '@/assets/xTIME.png';
const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-background to-card" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container relative z-10 px-4 py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Left content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Up-Only Mechanism</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="text-foreground">Stake </span>
              <span className="text-primary text-glow-gold">TIME</span>
              <br />
              <span className="text-foreground">Earn </span>
              <span className="text-cyan text-glow-cyan">Forever</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
              xTIME is an up-only token backed by TIME, the dividend-bearing PulseChain asset. 
              Mint or redeem with a 5% fee — no transfer or trading fees.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a 
                href="#dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-semibold text-lg bg-gradient-to-r from-primary to-gold-glow text-primary-foreground hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                Start Minting
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
              <a 
                href="#about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-semibold text-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
              >
                Learn More
              </a>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-10">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <Shield className="w-4 h-4 text-cyan" />
                <span className="text-sm text-muted-foreground">5% Fee Only</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Arbitrage Resistant</span>
              </div>
            </div>
          </motion.div>

          {/* Right content - Animated Logo */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="flex-1 flex items-center justify-center"
          >
            <div className="relative">
              {/* Glow rings */}
              <div className="absolute inset-0 -m-8 rounded-full bg-gradient-to-r from-primary/20 to-cyan/20 blur-3xl animate-pulse" />
              <div className="absolute inset-0 -m-4 rounded-full border-2 border-primary/20 animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-0 -m-12 rounded-full border border-cyan/10 animate-[spin_30s_linear_infinite_reverse]" />
              
              {/* Main logo */}
              <div className="relative float">
                <img 
                  src={xTimeLogo} 
                  alt="xTIME Token" 
                  className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
