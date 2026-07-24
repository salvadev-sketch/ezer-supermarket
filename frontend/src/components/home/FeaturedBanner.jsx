import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import './FeaturedBanner.css';

export default function FeaturedBanner({ items = [], loading = false }) {
  const { t } = useLanguage();

  if (loading || items.length === 0) return null;

  return (
    <section className="section featured-banner-section">
      <div className="container">
        <div className="featured-banner">
          {items.map((product) => (
            <Link
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="featured-banner-item"
              key={product.id}
            >
              <img src={product.imageURL} alt={product.name} className="featured-banner-img" loading="lazy" />
              <div className="featured-banner-overlay">
                <span className="featured-banner-category">{t(`categories.${product.category}`)}</span>
                <h3 className="featured-banner-name">{product.name}</h3>
                {product.description && (
                  <p className="featured-banner-desc">{product.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
