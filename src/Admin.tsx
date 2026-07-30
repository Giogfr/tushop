import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package, TrendingUp, DollarSign, Activity, Lock, MapPin, Phone, LogOut, Menu, X } from 'lucide-react';
import { products as defaultProducts } from './data';
import { auth, db } from './lib/firebase';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<any[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({ id: '', name: '', category: '', price: 0, imageUrl: '', description: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to products
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prodData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdminProducts(prodData);
    });

    // Subscribe to orders
    const unsubscribeOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const orderData = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
      // Sort by date descending
      orderData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(orderData);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeOrders();
    };
  }, [user]);

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct && editingProduct.id) {
        await updateDoc(doc(db, 'products', editingProduct.id), {
          ...productForm,
          price: Number(productForm.price)
        });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productForm,
          price: Number(productForm.price)
        });
      }
      setIsProductModalOpen(false);
    } catch (err: any) {
      alert("Error guardando producto: " + err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err: any) {
        alert("Error eliminando producto: " + err.message);
      }
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setIsProductModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ id: '', name: '', category: '', price: 0, imageUrl: '', description: '' });
    setIsProductModalOpen(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError('Credenciales incorrectas o usuario no encontrado');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50">Cargando...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Acceso Administrador</h1>
          <p className="text-slate-500 mb-8 text-sm">Introduce tu email y contraseña para acceder al panel.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center mb-4"
              />
              <input 
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center"
              />
              {error && <p className="text-rose-500 text-sm mt-2">{error}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition-colors"
              >
                Entrar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  }

  const chartData = [
    { name: 'Lun', ventas: 400 },
    { name: 'Mar', ventas: 300 },
    { name: 'Mié', ventas: 550 },
    { name: 'Jue', ventas: 450 },
    { name: 'Vie', ventas: 700 },
    { name: 'Sáb', ventas: 900 },
    { name: 'Dom', ventas: 800 },
  ];

  const totalRevenue = orders.reduce((acc, o) => {
    const val = typeof o.total === 'string' ? parseFloat(o.total.replace('€', '')) : o.total;
    return acc + (isNaN(val) ? 0 : val);
  }, 0);

  const stats = [
    { name: 'Ingresos Totales', value: `${totalRevenue.toFixed(2)}€`, change: '+12%', icon: DollarSign },
    { name: 'Pedidos Totales', value: orders.length.toString(), change: '+8%', icon: ShoppingBag },
    { name: 'Visitantes', value: '3,204', change: '+24%', icon: Users },
    { name: 'Tasa de Conversión', value: '4.8%', change: '+1.2%', icon: Activity },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-lg font-bold">
            T
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            TuShop Admin
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
          aria-label="Toggle Navigation"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-200 ease-in-out md:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-6 hidden md:block">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-xl font-bold">
              T
            </div>
            <span className="text-xl font-extrabold tracking-tight">
              TuShop Admin
            </span>
          </div>
        </div>

        <div className="p-4 flex md:hidden items-center justify-between border-b border-slate-800">
          <span className="font-semibold text-slate-300">Menú</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button
            onClick={() => { setActiveTab('products'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Package className="h-5 w-5" />
            <span className="font-medium">Productos</span>
          </button>
          <button
            onClick={() => { setActiveTab('orders'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
            <span className="font-medium">Pedidos ({orders.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Configuración</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800 md:border-t-0">
          <a href="/" className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors">
            &larr; Volver a la tienda
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="p-4 sm:p-6 md:p-8">
          <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                {activeTab === 'dashboard' && 'Resumen del Panel'}
                {activeTab === 'products' && 'Gestión de Productos'}
                {activeTab === 'orders' && 'Historial de Pedidos'}
                {activeTab === 'settings' && 'Configuración del Sitio'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">Bienvenido de nuevo al panel de administración.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors self-start sm:self-auto"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </header>

          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <stat.icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-500">{stat.name}</h3>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts & Recent Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">Evolución de Ventas (Últimos 7 días)</h2>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `${value}€`} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        />
                        <Bar dataKey="ventas" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Pedidos Recientes</h2>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Ver todos</button>
                  </div>
                  <div className="space-y-4">
                    {orders.slice(0, 4).map((order, i) => (
                      <div key={i} className="flex items-center justify-between pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{order.id}</p>
                          <p className="text-xs text-slate-500">{order.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-indigo-600">{order.total}</p>
                          <p className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full inline-block mt-1">{order.status}</p>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-sm text-slate-500 text-center py-4">No hay pedidos recientes.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800">Inventario de Productos</h2>
                <button onClick={handleAddProduct} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-500 transition-colors">
                  + Añadir Producto
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Producto</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoría</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Precio</th>
                      <th className="pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-lg object-cover bg-slate-100" />
                            <span className="text-sm font-medium text-slate-800">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-600">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-800">{(Number(product.price) || 0).toFixed(2)}€</td>
                        <td className="py-4">
                          <button onClick={() => handleEditProduct(product)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mr-3">Editar</button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-rose-600 hover:text-rose-800 text-sm font-medium">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBag className="h-16 w-16 text-slate-200 mb-4" />
                  <h3 className="text-lg font-bold text-slate-800">No hay pedidos aún</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-2">Los pedidos que realicen tus clientes aparecerán aquí.</p>
                </div>
              ) : (
                orders.map((order, i) => (
                  <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-800">{order.id}</h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {order.status}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-slate-500">{order.date}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Datos del Cliente</h4>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Users className="h-4 w-4 text-slate-400" />
                              <span className="font-medium">{order.customer}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Phone className="h-4 w-4 text-slate-400" />
                              <span>{order.phone}</span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-slate-700">
                              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                              <span>{order.address}, {order.city}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Detalle del Pedido</h4>
                          <div className="space-y-3">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-800">{item.quantity}x</span>
                                  <span className="text-slate-600 line-clamp-1">{item.name}</span>
                                </div>
                                <span className="font-medium text-slate-700">{(item.price * item.quantity).toFixed(2)}€</span>
                              </div>
                            ))}
                            <div className="border-t border-slate-200 pt-3 flex items-center justify-between font-bold">
                              <span className="text-slate-800">Total</span>
                              <span className="text-indigo-600 text-lg">{order.total}</span>
                            </div>
                            <div className="text-xs text-slate-500 text-right">
                              Pago Contra Reembolso
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'settings' && (
             <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center py-20 text-center"
           >
             <Settings className="h-16 w-16 text-slate-200 mb-4" />
             <h3 className="text-lg font-bold text-slate-800">Configuración</h3>
             <p className="text-sm text-slate-500 max-w-sm mt-2">Personaliza los métodos de pago, costes de envío (Baleares +10€), dominios y más.</p>
           </motion.div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-xl font-bold text-slate-800 mb-4">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={saveProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
                  <input required type="text" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Precio (€)</label>
                  <input required type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL de Imagen</label>
                <input required type="text" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea required rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors">Guardar</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
