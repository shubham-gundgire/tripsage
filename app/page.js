import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TrendingDestinations from './components/TrendingDestinations';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrendingDestinations />
    </main>
  );
}
