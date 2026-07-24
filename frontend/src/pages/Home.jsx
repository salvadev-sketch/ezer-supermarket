import Hero from '../components/home/Hero.jsx';
import FeaturedBanner from '../components/home/FeaturedBanner.jsx';
import CategoryStrip from '../components/home/CategoryStrip.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import StatsBar from '../components/home/StatsBar.jsx';
import HowItWorks from '../components/home/HowItWorks.jsx';

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedBanner />
      <CategoryStrip />
      <FeaturedProducts />
      <StatsBar />
      <HowItWorks />
    </>
  );
}
