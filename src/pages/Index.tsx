import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import Dashboard from '@/components/Dashboard';
import AboutSection from '@/components/AboutSection';
import Footer from '@/components/Footer';
import wallpaper from '@/assets/wallpaper.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Background wallpaper */}
      <div 
        className="fixed inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main>
          <HeroSection />
          <Dashboard />
          <AboutSection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
