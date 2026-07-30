import { X, Minus, Plus, ShoppingBag, Truck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { useState } from 'react';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onClearCart }: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const validProvinces = [
    "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Baleares", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca", "Jaén", "La Rioja", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia", "Pontevedra", "Salamanca", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza"
  ];

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    region: 'Madrid', // Default
    postalCode: '',
    population: '',
    phone: '',
    email: '',
    notes: ''
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = formData.region === 'Baleares' ? 10 : 0;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{5}$/.test(formData.postalCode)) {
      setError('El código postal introducido no es válido.');
      return;
    }

    const invalidPrefixes = ['35', '38', '51', '52'];
    if (invalidPrefixes.some(prefix => formData.postalCode.startsWith(prefix))) {
      setError('Lo sentimos, no realizamos envíos a Canarias, Ceuta o Melilla.');
      return;
    }
    
    // Save order to Firestore
    const newOrder = {
      id: `#ORD-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      customer: formData.name,
      address: `${formData.address}, ${formData.population} (${formData.postalCode}), ${formData.region}`,
      city: formData.population,
      phone: formData.phone,
      date: new Date().toISOString().split('T')[0],
      total: `${total.toFixed(2)}€`,
      status: 'Pendiente',
      items: items
    };
    
    import('../lib/firebase').then(({ db }) => {
      import('firebase/firestore').then(({ collection, addDoc }) => {
        addDoc(collection(db, 'orders'), newOrder).then(() => {
          setIsSuccess(true);
          setTimeout(() => {
            onClearCart();
            setIsSuccess(false);
            setIsCheckingOut(false);
            onClose();
          }, 4000);
        }).catch(err => {
          console.error("Error adding document: ", err);
          setError("Error procesando el pedido.");
        });
      });
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white border-l border-slate-200 shadow-2xl sm:w-[400px]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                Tu Carrito
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex h-full flex-col items-center justify-center text-center space-y-4"
                >
                  <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                  <h3 className="text-xl font-bold text-slate-900">¡Pedido Confirmado!</h3>
                  <p className="text-slate-500">
                    Gracias por tu compra. Te enviaremos los productos y pagarás en efectivo al recibirlos (Contra Reembolso).
                  </p>
                </motion.div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="rounded-full bg-slate-100 p-4">
                    <ShoppingBag className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-800">Tu carrito está vacío</p>
                  <p className="text-sm text-slate-500">Agrega algunos productos para continuar.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="mt-4 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                  >
                    Explorar Catálogo
                  </motion.button>
                </div>
              ) : isCheckingOut ? (
                <motion.form 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="mb-6 flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 text-indigo-800">
                    <Truck className="h-5 w-5 shrink-0 text-indigo-600" />
                    <p className="text-sm font-medium">Pago Contra Reembolso: Pagas en efectivo al recibir tu pedido en casa.</p>
                  </div>
                  
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">Nombre *</label>
                    <input
                      id="name"
                      required
                      type="text"
                      placeholder="Nombre"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">Delivery address *</label>
                    <input
                      id="address"
                      required
                      type="text"
                      placeholder="Calle (nombre de la calle, numero, indicar si es piso o casa)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div>
                    <label htmlFor="region" className="mb-1.5 block text-sm font-medium text-slate-700">País / Región *</label>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-500">
                        España
                      </div>
                      <select
                        id="region"
                        required
                        className="flex-[2] rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                      >
                        {validProvinces.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="postalCode" className="mb-1.5 block text-sm font-medium text-slate-700">Postal code *</label>
                      <input
                        id="postalCode"
                        required
                        type="text"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                      />
                    </div>
                    <div>
                      <label htmlFor="population" className="mb-1.5 block text-sm font-medium text-slate-700">Piso *</label>
                      <input
                        id="population"
                        required
                        type="text"
                        placeholder="Ej. 1º A"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value={formData.population}
                        onChange={(e) => setFormData({...formData, population: e.target.value})}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-600">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">Phone *</label>
                    <input
                      id="phone"
                      required
                      type="tel"
                      placeholder="Phone"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email Address (opcional)</label>
                    <input
                      id="email"
                      type="email"
                      placeholder="Email Address"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-slate-700">Notas del pedido (opcional)</label>
                    <textarea
                      id="notes"
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                </motion.form>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <motion.li 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={item.id} 
                      className="flex items-center gap-4 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover bg-slate-50"
                      />
                      <div className="flex flex-1 flex-col">
                        <h4 className="line-clamp-1 font-bold text-slate-800 text-sm">{item.name}</h4>
                        <p className="text-sm font-semibold text-slate-900 mt-1" translate="no">{item.price.toFixed(2)}€</p>
                        
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50">
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-slate-700" translate="no">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && !isSuccess && (
              <div className="border-t border-slate-100 bg-white p-4 sm:p-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="mb-4 space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-700" translate="no">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío ({formData.region})</span>
                    <span className={`font-semibold ${shipping === 0 ? 'text-emerald-500' : 'text-slate-700'}`} translate="no">
                      {shipping === 0 ? 'Gratis' : `+${shipping.toFixed(2)}€`}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
                    <span>Total a Pagar en Casa</span>
                    <span className="text-indigo-600" translate="no">{total.toFixed(2)}€</span>
                  </div>
                </div>
                
                <div className="mb-4 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-800">
                  <p className="font-medium">ℹ️ Información de envío:</p>
                  <ul className="mt-1 ml-4 list-disc space-y-0.5 opacity-90">
                    <li>Península: <strong>Envío Gratis</strong></li>
                    <li>Baleares: <strong>+10€</strong></li>
                    <li>Canarias, Ceuta y Melilla: <strong>No hay envíos</strong></li>
                  </ul>
                </div>

                {isCheckingOut ? (
                  <div className="flex gap-3 mt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setIsCheckingOut(false)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      Volver
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={(e) => {
                        const form = document.querySelector('form');
                        if (form?.reportValidity()) {
                          handleSubmit(e);
                        }
                      }}
                      className="flex-[2] rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-[0.98]"
                    >
                      Confirmar Pedido
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCheckingOut(true)}
                    className="mt-4 w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white transition-all hover:bg-indigo-500 active:scale-[0.98]"
                  >
                    Pedir Ahora (Pago en Casa)
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
