import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import TrendingDestinations from './components/TrendingDestinations';
import BlogSection from './components/BlogSection';
import TestimonialsSection from './components/TestimonialsSection';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <TrendingDestinations />
      <BlogSection />
      <TestimonialsSection />
    </main>
  );
}
