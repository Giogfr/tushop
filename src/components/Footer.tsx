import { Instagram } from 'lucide-react';
import { motion } from 'motion/react';

export function Footer() {
  return (
    <footer className="mt-8 border-t border-slate-200 pt-16 pb-8 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-800">TuShop</span>
            <p className="mt-4 max-w-sm text-sm text-slate-500 leading-relaxed">
              La tienda online moderna donde encuentras lo mejor en tecnología, moda y accesorios. Compra seguro desde casa y paga al recibir tu paquete.
            </p>
            
            <div className="mt-4 max-w-sm rounded-xl bg-slate-50 p-4 text-xs text-slate-600 border border-slate-100">
              <span className="block font-bold text-slate-800 mb-2">Información de Envíos:</span>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Península: <strong>Envío Gratis</strong></li>
                <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Baleares: <strong>+10€</strong></li>
                <li className="flex items-center gap-2 text-rose-500 font-medium"><span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span> No hay envíos a Canarias, Ceuta y Melilla</li>
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com/tushop.es" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
              >
                <Instagram className="h-5 w-5" />
                @tushop.es
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                href="https://tiktok.com/@tushop.es" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.66a6.33 6.33 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                @tushop.es
              </motion.a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-bold text-slate-800">Enlaces Rápidos</h3>
            <ul className="mt-4 space-y-3">
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Inicio</motion.a></li>
              <li><motion.a whileHover={{ x: 5 }} href="#catalogo" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Catálogo</motion.a></li>
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Sobre Nosotros</motion.a></li>
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Contacto</motion.a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-800">Ayuda y Soporte</h3>
            <ul className="mt-4 space-y-3">
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Envíos y Entregas</motion.a></li>
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Pago Contra Reembolso</motion.a></li>
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Devoluciones</motion.a></li>
              <li><motion.a whileHover={{ x: 5 }} href="#" className="inline-block text-sm font-medium text-slate-500 transition-colors hover:text-indigo-600">Preguntas Frecuentes</motion.a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs font-medium text-slate-400">
            &copy; {new Date().getFullYear()} TuShop. Todos los derechos reservados.
          </p>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500 sm:mt-0">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Stock Disponible</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Pago al recibir</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">Privacidad y Términos</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
