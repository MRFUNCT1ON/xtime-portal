import { motion } from 'framer-motion';
import { TrendingUp, Shield, Repeat, Coins } from 'lucide-react';

const features = [
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: 'Up-Only Price',
    description: 'The mint/redeem price is coded to only increase. Every fee collected adds value to the pool.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: '5% Fee Structure',
    description: 'Simple and fair — 5% on mint, 5% on redeem. Zero fees for transfers and DEX trading.',
  },
  {
    icon: <Repeat className="w-6 h-6" />,
    title: 'Arbitrage Mechanism',
    description: 'Any price gap between DEX and mint/redeem creates profitable arbitrage that benefits all holders.',
  },
  {
    icon: <Coins className="w-6 h-6" />,
    title: 'Backed by TIME',
    description: 'TIME is a dividend-bearing token on PulseChain that yields PLS to holders, by InternetMoney.',
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How <span className="text-cyan text-glow-cyan">xTIME</span> Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A revolutionary up-only token design that ensures every holder benefits from market activity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 border border-border hover:border-cyan/30 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan/10 text-cyan group-hover:bg-cyan/20 transition-colors">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <a
            href="#mint"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-display font-semibold text-lg bg-gradient-to-r from-cyan to-cyan-glow text-secondary-foreground hover:shadow-xl hover:shadow-cyan/30 transition-all duration-300"
          >
            Start Earning Now
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
