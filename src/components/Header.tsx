import { ConnectButton } from '@rainbow-me/rainbowkit';
import xTimeLogo from '@/assets/xTIME.png';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={xTimeLogo} 
            alt="xTIME" 
            className="h-10 w-10 object-contain"
          />
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-primary text-glow-gold">
              xTIME
            </span>
            <span className="text-xs text-muted-foreground">
              Up-Only Token
            </span>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="#dashboard" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Dashboard
          </a>
          <a 
            href="#about" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            About
          </a>
        </nav>

        {/* Wallet Connect */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            mounted,
          }) => {
            const ready = mounted;
            const connected = ready && account && chain;

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  style: {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <button
                        onClick={openConnectModal}
                        className="px-5 py-2.5 rounded-lg font-display text-sm font-semibold bg-gradient-to-r from-primary to-gold-glow text-primary-foreground hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                      >
                        Connect Wallet
                      </button>
                    );
                  }

                  if (chain.unsupported) {
                    return (
                      <button
                        onClick={openChainModal}
                        className="px-5 py-2.5 rounded-lg font-display text-sm font-semibold bg-destructive text-destructive-foreground"
                      >
                        Wrong Network
                      </button>
                    );
                  }

                  return (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={openChainModal}
                        className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                      >
                        {chain.hasIcon && (
                          <div className="w-5 h-5">
                            {chain.iconUrl && (
                              <img
                                alt={chain.name ?? 'Chain icon'}
                                src={chain.iconUrl}
                                className="w-5 h-5"
                              />
                            )}
                          </div>
                        )}
                        <span className="text-sm font-medium">{chain.name}</span>
                      </button>

                      <button
                        onClick={openAccountModal}
                        className="px-4 py-2 rounded-lg font-medium text-sm neon-border hover:glow-gold transition-all duration-300"
                      >
                        <span className="relative z-10">
                          {account.displayName}
                        </span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            );
          }}
        </ConnectButton.Custom>
      </div>
    </motion.header>
  );
};

export default Header;
