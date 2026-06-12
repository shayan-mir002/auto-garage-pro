import { X, CheckCircle, Tag } from 'lucide-react';

export default function ProductModal({ product, onClose, onRequestBuy }) {
  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Image */}
        <div className="relative h-56 bg-dark-600 rounded-t-xl overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-lg bg-dark-900/80 text-slate-400 hover:text-white backdrop-blur-sm transition-colors"
          >
            <X size={18} />
          </button>
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-900/80 text-accent-orange border border-accent-orange/30 backdrop-blur-sm">
            {product.category}
          </span>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-display font-bold text-white mb-2">{product.name}</h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-white">${product.price?.toFixed(2)}</span>
            <span className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">In Stock</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">{product.description}</p>

          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost flex-1 justify-center border border-dark-300">
              Close
            </button>
            <button onClick={() => { onClose(); onRequestBuy(product); }} className="btn-accent flex-1 justify-center">
              Request to Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
