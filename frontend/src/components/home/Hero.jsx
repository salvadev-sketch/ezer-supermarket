import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../utils/api.js';
import './Hero.css';

export default function Hero() {
  const { t } = useLanguage();
  const [heroImage, setHeroImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products/featured')
      .then((list) => {
        if (cancelled) return;
        const withPhoto = (list || []).find((p) => p.imageURL);
        if (withPhoto) setHeroImage(withPhoto.imageURL);
      })
      .catch(() => {
        /* fall back to icon art below */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="badge badge-success hero-badge">
            <i className="ti ti-bolt" aria-hidden="true" /> {t('hero.badge')}
          </span>
          <h1 className="hero-title">{t('hero.tagline')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              <i className="ti ti-shopping-bag" aria-hidden="true" /> {t('hero.shopNow')}
            </Link>
            <Link to="/track" className="btn btn-secondary">
              <i className="ti ti-map-pin" aria-hidden="true" /> {t('hero.trackOrder')}
            </Link>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-blob">
            {heroImage ? (
              <img src={heroImage} alt="" className="hero-art-photo" />
            ) : (
              <i className="ti ti-basket hero-art-fallback-icon" />
            )}
          </div>
          <div className="hero-art-chip hero-art-chip-1"><i className="ti ti-apple" /></div>
          <div className="hero-art-chip hero-art-chip-2"><i className="ti ti-bread" /></div>
          <div className="hero-art-chip hero-art-chip-3"><i className="ti ti-milk" /></div>
          <div className="hero-art-chip hero-art-chip-4"><i className="ti ti-bike" /></div>
        </div>
      </div>
    </section>
  );
}
