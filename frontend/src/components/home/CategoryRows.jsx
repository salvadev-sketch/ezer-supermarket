import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { api } from '../../utils/api.js';
import { mapProducts } from '../../utils/mapProduct.js';
import FeaturedProductCard from './FeaturedProductCard.jsx';
import './CategoryRows.css';

export default function CategoryRows() {
  const { t } = useLanguage();
  const [grouped, setGrouped] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/products')
      .then(({ products, categories }) => {
        if (cancelled) return;
        const mapped = mapProducts(products);
        const rows = (categories || [])
          .map((category) => ({
            category,
            items: mapped.filter((p) => p.category === category),
          }))
          .filter((row) => row.items.length > 0);
        setGrouped(rows);
      })
      .catch(() => {
        if (!cancelled) setGrouped([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div className="category-row-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="product-card-skeleton" key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (grouped.length === 0) return null;

  return (
    <>
      {grouped.map(({ category, items }) => (
        <section className="section category-row-section" key={category}>
          <div className="container">
            <div className="category-row-header">
              <h2 className="section-title" style={{ margin: 0 }}>{t(`categories.${category}`)}</h2>
              <Link
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="btn btn-secondary btn-sm"
              >
                {t('featured.viewAll')} <i className="ti ti-arrow-right" aria-hidden="true" />
              </Link>
            </div>
            <div className="category-row-grid">
              {items.map((product) => (
                <FeaturedProductCard product={product} key={product.id} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
