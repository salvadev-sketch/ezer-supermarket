import { useEffect, useState } from 'react';
import Hero from '../components/home/Hero.jsx';
import FeaturedBanner from '../components/home/FeaturedBanner.jsx';
import CategoryStrip from '../components/home/CategoryStrip.jsx';
import FeaturedProducts from '../components/home/FeaturedProducts.jsx';
import CategoryRows from '../components/home/CategoryRows.jsx';
import { api } from '../utils/api.js';
import { mapProducts } from '../utils/mapProduct.js';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products/featured')
      .then((list) => {
        if (cancelled) return;
        const withPhoto = mapProducts(list).filter((p) => p.imageURL);
        setFeatured(withPhoto.slice(0, 4));
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingFeatured(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The first featured product's photo becomes the Hero background.
  // The rest (if any) are shown in the banner strip below, so the
  // same photo never shows twice.
  const heroImage = featured[0]?.imageURL || null;
  const bannerItems = featured.slice(1);

  return (
    <>
      <Hero heroImage={heroImage} />
      <FeaturedBanner items={bannerItems} loading={loadingFeatured} />
      <CategoryStrip />
      <FeaturedProducts />
      <CategoryRows />
    </>
  );
}
