import { useState, useEffect } from 'react';
import { ShoppingCart, Package, ShieldCheck, Zap, X, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem } from './types';
import { products as defaultProducts } from './data';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { Footer } from './components/Footer';
import { db } from './lib/firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [priceSort, setPriceSort] = useState<string>('');

  useEffect(() => {
    // SEO Meta Tags Dynamic Update
    document.title = "TuShop | La mejor tienda contra reembolso en España";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Descubre las mejores ofertas con envío 24/48h y pago contra reembolso en TuShop.");
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), async (snapshot) => {
      const prodData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
      setShopProducts(prodData);
    });
    return () => unsubscribe();
  }, []);

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const categories = ['Todos', ...Array.from(new Set(shopProducts.map(p => p.category)))];

  const filteredProducts = shopProducts
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(p => selectedCategory === 'Todos' || p.category === selectedCategory)
    .sort((a, b) => {
      if (priceSort === 'asc') return a.price - b.price;
      if (priceSort === 'desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-[#f8fafc]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <img src="/tushop.jpg" alt="TuShop Logo" className="h-8 w-8 rounded-lg object-cover" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-800" translate="no">
              TuShop
            </span>
          </div>
          
          <nav className="hidden gap-8 text-sm font-medium text-slate-500 md:flex">
            <a href="#" className="text-indigo-600 transition-colors hover:text-slate-800">Inicio</a>
            <a href="#catalogo" className="transition-colors hover:text-slate-800">Catálogo</a>
            <a href="#beneficios" className="transition-colors hover:text-slate-800">Beneficios</a>
          </nav>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Abrir carrito"
          >
            <ShoppingCart className="h-4 w-4" />
            Carrito ({cartItemsCount})
          </motion.button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative flex min-h-[400px] items-end overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 pb-16">
            <img 
              src="/banner.jpg" 
              alt="Colección TuShop" 
              className="absolute inset-0 h-full w-full object-cover opacity-80" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/10"></div>
            <div className="relative z-10 max-w-lg w-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <motion.a 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href="#catalogo"
                  className="inline-flex justify-center rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition-all hover:bg-indigo-500 shadow-lg shadow-indigo-500/30"
                >
                  Ver Catálogo
                </motion.a>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                  </div>
                  <span>Pago Contra Reembolso</span>
                </div>
              </motion.div>
            </div>
            <div className="absolute right-0 top-0 flex h-full w-1/2 items-center justify-center bg-gradient-to-l from-indigo-500/20 to-transparent opacity-40">
               <div className="h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="beneficios" className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-100"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Package className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Envío Rápido</h3>
                <p className="mt-2 text-sm text-slate-500">Entregas en 24/48h a toda la península. Recibe tu pedido sin demoras.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-100"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Pago Contra Reembolso</h3>
                <p className="mt-2 text-sm text-slate-500">La forma más segura. Paga en efectivo solo cuando tengas el paquete en tus manos.</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-sm border border-slate-100"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Zap className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Calidad Garantizada</h3>
                <p className="mt-2 text-sm text-slate-500">Seleccionamos los mejores productos del mercado para garantizar tu satisfacción.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <section id="catalogo" className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Lo más vendido esta semana</h2>
                <p className="mt-1 text-sm text-slate-500">Descubre nuestros productos destacados</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-64"
                  />
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="">Ordenar</option>
                    <option value="asc">Menor precio</option>
                    <option value="desc">Mayor precio</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-20">
                <Package className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-lg font-medium text-slate-500">No se encontraron productos</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); setPriceSort(''); }}
                  className="mt-4 text-sm font-bold text-indigo-600 hover:text-indigo-500"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ProductCard 
                      product={product} 
                      onAddToCart={handleAddToCart}
                      onBuyNow={handleBuyNow}
                      onClickProduct={setSelectedProduct}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              <h2 className="mb-6 text-4xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-5xl">
                Our Satisfied Customers
              </h2>
              <p className="text-lg leading-relaxed text-slate-600 font-medium">
                With over 250+ orders per month, TuShop is your trusted store for buying the latest brands and the best quality.
              </p>
            </div>
            
            {/* Right Images (Masonry-style Grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4 pt-8">
                <img 
                  src="/744820089_17920442991396890_1543047889710806134_n.jpg" 
                  alt="Customer Review" 
                  className="rounded-2xl object-cover w-full shadow-lg" 
                />
                <img 
                  src="/746452211_17920440192396890_6155256574579876520_n.jpg" 
                  alt="Customer Review" 
                  className="rounded-2xl object-cover w-full shadow-lg" 
                />
              </div>
              <div className="flex flex-col gap-4 pb-8">
                <img 
                  src="/743817471_17920440111396890_4495149206956497971_n.jpg" 
                  alt="Customer Review" 
                  className="rounded-2xl object-cover w-full shadow-lg" 
                />
                <img 
                  src="/745829407_17920440045396890_6296225968161485777_n.jpg" 
                  alt="Customer Review" 
                  className="rounded-2xl object-cover w-full shadow-lg" 
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-slate-500 backdrop-blur-md transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-slate-50">
                  <img 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name} 
                    className="h-64 w-full object-cover md:h-full md:min-h-[400px]"
                  />
                </div>
                <div className="flex flex-col p-6 md:w-1/2 md:p-8">
                  <div className="mb-2 inline-flex self-start rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    {selectedProduct.category}
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-900">{selectedProduct.name}</h2>
                  <span className="mb-6 text-3xl font-extrabold text-slate-900">{Number(selectedProduct.price).toFixed(2)}€</span>
                  
                  <div className="mb-8 flex-1">
                    <h3 className="mb-2 font-bold text-slate-800">Descripción</h3>
                    <p className="text-sm leading-relaxed text-slate-500">
                      {selectedProduct.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleBuyNow(selectedProduct)}
                      className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition-colors hover:bg-indigo-500"
                    >
                      Comprar Ahora
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(selectedProduct)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      Añadir al Carrito
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}
