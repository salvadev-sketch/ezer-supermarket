import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import './CategoryStrip.css';

// Fallback icon shown while a category photo loads / if it fails.
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

// Placeholder photo per category — swap these for your own product/category
// photography before launch (e.g. images uploaded via the dashboard).
const CATEGORY_PHOTOS = {
  'Fresh Produce': 'https://loremflickr.com/160/160/vegetables,fruit',
  'Bakery': 'https://loremflickr.com/160/160/bread,bakery',
  'Dairy & Eggs': 'https://loremflickr.com/160/160/eggs,dairy',
  'Beverages': 'https://loremflickr.com/160/160/juice,drink',
  'Meat & Fish': 'https://loremflickr.com/160/160/fish,seafood',
  'Grains & Staples': 'https://loremflickr.com/160/160/rice,grain',
  'Snacks & Confectionery': 'https://loremflickr.com/160/160/candy,snack',
  'Condiments & Sauces': 'https://loremflickr.com/160/160/sauce,condiment',
  'Personal Care': 'https://loremflickr.com/160/160/cosmetics,skincare',
  'Household & Cleaning': 'https://loremflickr.com/160/160/cleaning,detergent',
  'Health & Baby': 'https://loremflickr.com/160/160/baby,pharmacy',
};

export default function CategoryStrip() {
  const { t } = useLanguage();

  return (
    <section className="section category-strip-section">
      <div className="container">
        <h2 className="section-title">{t('categoryStrip.title')}</h2>
        <div className="category-strip">
          {Object.entries(CATEGORY_PHOTOS).map(([category, photo]) => (
            <Link
              to={`/shop?category=${encodeURIComponent(category)}`}
              className="category-chip"
              key={category}
            >
              <span className="category-chip-icon">
                <img
                  src={photo}
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
                <i className={`ti ${CATEGORY_ICONS[category]} category-chip-fallback`} aria-hidden="true" />
              </span>
              <span className="category-chip-label">{t(`categories.${category}`)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
