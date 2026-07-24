import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import './CategoryStrip.css';

const CATEGORY_ICONS = {
  'Fresh Produce': 'ti-apple',
  'Bakery': 'ti-bread',
  'Dairy & Eggs': 'ti-egg',
  'Beverages': 'ti-bottle',
  'Meat & Fish': 'ti-fish',
  'Grains & Staples': 'ti-wheat',
  'Snacks & Confectionery': 'ti-candy',
  'Condiments & Sauces': 'ti-droplet',
  'Personal Care': 'ti-spray',
  'Household & Cleaning': 'ti-brush',
  'Health & Baby': 'ti-heart',
};

export default function CategoryStrip() {
  const { t } = useLanguage();

  return (
    <section className="section category-strip-section">
      <div className="container">
        <h2 className="section-title">{t('categoryStrip.title')}</h2>
        <div className="category-strip">
          {Object.entries(CATEGORY_ICONS).map(([category, icon]) => (
            <Link
              to={`/shop?category=${encodeURIComponent(category)}`}
              className="category-chip"
              key={category}
            >
              <span className="category-chip-icon">
                <i className={`ti ${icon}`} aria-hidden="true" />
              </span>
              <span className="category-chip-label">{t(`categories.${category}`)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
