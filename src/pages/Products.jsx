import { useEffect, useState } from 'react';
import { ShoppingBag, Search, Filter, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import ProductModal from '../components/ProductModal';
import Pagination from '../components/Pagination';
import { PRODUCT_CATEGORIES, PRODUCTS_PER_PAGE, SEED_PRODUCTS } from '../utils/constants';

const SORT_OPTIONS = [
  { label: 'Name A–Z',     value: 'name_asc'   },
  { label: 'Name Z–A',     value: 'name_desc'  },
  { label: 'Price Low–High', value: 'price_asc' },
  { label: 'Price High–Low', value: 'price_desc'},
];

export default function Products() {
  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [category, setCategory]     = useState('All');
  const [sort, setSort]             = useState('name_asc');
  const [page, setPage]             = useState(1);
  const [viewProduct, setViewProduct] = useState(null);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('products').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      setProducts(data?.length > 0 ? data : SEED_PRODUCTS.map((p, i) => ({ ...p, id: String(i + 1) })));
    } catch {
      setProducts(SEED_PRODUCTS.map((p, i) => ({ ...p, id: String(i + 1) })));
    } finally {
      setLoading(false);
    }
  };

  // Filter + Search
  let filtered = products.filter((p) => {
    const matchCat    = category === 'All' || p.category === category;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Sort
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'name_asc')   return a.name.localeCompare(b.name);
    if (sort === 'name_desc')  return b.name.localeCompare(a.name);
    if (sort === 'price_asc')  return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / PRODUCTS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);

  const handlePageChange     = (p) => { setPage(p); window.scrollTo({ top: 300, behavior: 'smooth' }); };
  const handleCategoryChange = (cat) => { setCategory(cat); setPage(1); };
  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <span className="section-badge"><ShoppingBag size={12} /> Parts &amp; Accessories</span>
        <h1 className="section-title">Our Product Catalog</h1>
        <p className="section-subtitle mx-auto">
          Genuine auto parts and accessories. Add items to your cart and place your order directly.
        </p>
      </div>

      {/* Search + Filter + Sort bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text" value={search} onChange={handleSearch}
                placeholder="Search products..." className="input pl-9 py-2.5"
              />
            </div>
            {/* Sort */}
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="select py-2.5 text-sm">
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          {/* Category filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} className="text-slate-500 flex-shrink-0" />
            {PRODUCT_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  category === cat ? 'bg-brand-gradient text-white' : 'bg-dark-600 text-slate-400 hover:text-white border border-dark-300'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex items-center justify-between">
        <p className="text-slate-500 text-sm">
          Showing <span className="text-white font-semibold">{filtered.length}</span> product{filtered.length !== 1 ? 's' : ''}
          {category !== 'All' && <span> in <span className="text-accent-orange">{category}</span></span>}
          {search && <span> matching "<span className="text-accent-orange">{search}</span>"</span>}
        </p>
        <p className="text-slate-500 text-sm">Page {page} of {totalPages || 1}</p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-80 animate-pulse bg-dark-600" />)}
          </div>
        ) : paginated.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} onViewDetails={setViewProduct} />
            ))}
          </div>
        ) : (
          <div className="card p-14 text-center">
            <ShoppingBag size={40} className="text-dark-300 mx-auto mb-4" />
            <p className="text-slate-400">No products found.</p>
            <button onClick={() => { setSearch(''); setCategory('All'); }} className="btn-outline mt-4 mx-auto">
              Clear Filters
            </button>
          </div>
        )}
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      {viewProduct && (
        <ProductModal
          product={viewProduct}
          onClose={() => setViewProduct(null)}
          onRequestBuy={() => {}}
        />
      )}
    </div>
  );
}
