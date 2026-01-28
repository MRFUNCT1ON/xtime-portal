import xTimeLogo from '@/assets/xTIME.png';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={xTimeLogo} alt="xTIME" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-bold text-primary">xTIME</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a 
              href="https://ipfs.scan.pulsechain.com/address/0xdcE001f55DA9c00c438d4129c6f02000b818e792" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              PulseScan
            </a>
            <a 
              href="https://github.com/MrFUNCT1ON" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://x.com/don_function" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Twitter
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2025 xTIME by Don Function
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
