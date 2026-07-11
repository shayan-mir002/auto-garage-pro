import { useState } from 'react';
import { Eye, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../utils/constants';
import toast from 'react-hot-toast';

export default function ProductCard({ product, onViewDetails }) {
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name.slice(0, 30)}... added to cart!`);
  };

  return (
    <div className="card-hover flex flex-col group overflow-hidden">
      {/* Image */}
      <div className="relative overflow-hidden h-48 bg-dark-600 rounded-t-xl">
        {!imgError ? (
          <img
            src={getImageUrl(product.image_url, product.name)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-600">
            <Tag size={40} className="text-dark-300" />
          </div>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-900/80 text-accent-orange border border-accent-orange/30 backdrop-blur-sm">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-white font-semibold text-base leading-snug mb-1.5 line-clamp-2">{product.name}</h3>
        <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-2 flex-1">{product.description}</p>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-display font-bold text-white">${product.price?.toFixed(2)}</span>
          <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">In Stock</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 border border-dark-300 bg-dark-600/50 hover:border-brand-700 hover:text-white transition-all duration-200"
          >
            <Eye size={14} /> Details
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 btn-accent text-sm py-2.5 justify-center"
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
