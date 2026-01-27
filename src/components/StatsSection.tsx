import { motion } from 'framer-motion';
import { Users, ArrowRightLeft, Coins, TrendingUp } from 'lucide-react';
import xTimeLogo from '@/assets/xTIME.png';
import timeLogo from '@/assets/TIME.png';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  delay: number;
}

const StatCard = ({ icon, label, value, subValue, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="glass-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all duration-300 group"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
    </div>
    <p className="text-sm text-muted-foreground mb-1">{label}</p>
    <p className="stat-number text-3xl font-bold text-foreground">{value}</p>
    {subValue && (
      <p className="text-sm text-primary mt-1">{subValue}</p>
    )}
  </motion.div>
);

const StatsSection = () => {
  // Mock data - replace with actual contract reads
  const stats = {
    users: '1,234',
    transactions: '12,456',
    totalSupply: '5,678,901',
    backing: '5,972,345',
    price: '1.0523',
  };

  return (
    <section id="stats" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Protocol <span className="text-primary text-glow-gold">Statistics</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time data from the xTIME smart contract on PulseChain
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-primary" />}
            label="Current Price"
            value={`${stats.price} TIME`}
            subValue="↗ Up only"
            delay={0}
          />
          <StatCard
            icon={<Users className="w-6 h-6 text-primary" />}
            label="Total Holders"
            value={stats.users}
            delay={0.1}
          />
          <StatCard
            icon={<ArrowRightLeft className="w-6 h-6 text-primary" />}
            label="Total Transactions"
            value={stats.transactions}
            delay={0.2}
          />
          <StatCard
            icon={<Coins className="w-6 h-6 text-primary" />}
            label="xTIME Supply"
            value={stats.totalSupply}
            delay={0.3}
          />
        </div>

        {/* Price comparison card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto neon-border rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-display text-xl font-bold text-center mb-8">
              Token <span className="text-cyan">Backing</span>
            </h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              {/* xTIME side */}
              <div className="flex flex-col items-center gap-3">
                <img src={xTimeLogo} alt="xTIME" className="w-20 h-20" />
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-foreground">
                    {stats.totalSupply}
                  </p>
                  <p className="text-sm text-muted-foreground">xTIME Supply</p>
                </div>
              </div>

              {/* Separator */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-px h-16 md:w-16 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-transparent via-primary to-transparent" />
                <span className="font-display text-sm text-muted-foreground">Backed by</span>
                <div className="w-px h-16 md:w-16 md:h-px bg-gradient-to-b md:bg-gradient-to-r from-transparent via-cyan to-transparent" />
              </div>

              {/* TIME side */}
              <div className="flex flex-col items-center gap-3">
                <img src={timeLogo} alt="TIME" className="w-20 h-20" />
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-primary text-glow-gold">
                    {stats.backing}
                  </p>
                  <p className="text-sm text-muted-foreground">TIME Locked</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
