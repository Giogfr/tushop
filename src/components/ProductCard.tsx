import { ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  onClickProduct: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onBuyNow, onClickProduct }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white p-4 shadow-sm border border-slate-100 transition-all hover:shadow-md hover:border-indigo-100"
    >
      <div 
        className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-slate-100 cursor-pointer"
        onClick={() => onClickProduct(product)}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-md shadow-sm">
          {product.category}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <h3 
          className="text-sm font-bold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
          onClick={() => onClickProduct(product)}
        >
          {product.name}
        </h3>
        <p className="mt-1 mb-3 line-clamp-2 flex-1 text-xs text-slate-400">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-slate-900">
            {Number(product.price).toFixed(2)}€
          </span>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onBuyNow(product)}
            className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-500"
          >
            Comprar
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAddToCart(product)}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-800 transition-colors hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
            aria-label={`Añadir ${product.name} al carrito`}
          >
            <ShoppingCart className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
