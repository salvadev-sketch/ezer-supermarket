import { useLanguage } from '../../context/LanguageContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { formatFRw } from '../../utils/format.js';
import { getStockStatus } from '../../data/products.js';
import './FeaturedProductCard.css';

export default function FeaturedProductCard({ product }) {
  const { t } = useLanguage();
  const { addItem } = useCart();
  const isOut = getStockStatus(product) === 'outOfStock';

  return (
    <div className={`featured-card flat-card${isOut ? ' featured-card-out' : ''}`}>
      <div className="featured-card-image">
        {product.imageURL ? (
          <img src={product.imageURL} alt={product.name} loading="lazy" />
        ) : (
          <span className="featured-card-icon" aria-hidden="true">{product.icon}</span>
        )}
        <button
          type="button"
          className="featured-card-add"
          onClick={() => addItem(product, 1)}
          disabled={isOut}
          aria-label={t('shop.addToCart')}
        >
          <i className="ti ti-plus" aria-hidden="true" />
        </button>
      </div>
      <div className="featured-card-body">
        <span className="featured-card-category text-muted">{t(`categories.${product.category}`)}</span>
        <h3 className="featured-card-name">{product.name}</h3>
        <span className="featured-card-price">{formatFRw(product.price)}</span>
      </div>
    </div>
  );
}
