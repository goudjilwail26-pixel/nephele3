import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Package, Settings, LogOut, ArrowLeft, Menu, X, ShoppingCart, Search, Clock, Eye, CheckCircle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

function AdminSidebar({ mobileOpen, setMobileOpen, onSearchOpen }: { mobileOpen: boolean, setMobileOpen: (v: boolean) => void, onSearchOpen: () => void }) {
  const navigate = useNavigate();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-nephele-border bg-nephele-black flex flex-col transform transition-transform duration-300 md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-nephele-border flex items-center justify-between md:block">
          <div>
            <Link to="/" className="text-xs text-nephele-grey hover:text-nephele-white mb-6 flex items-center gap-2 transition-colors">
              <ArrowLeft size={14} /> Back to Store
            </Link>
            <h2 className="greek text-2xl font-light">Admin Hub</h2>
          </div>
          <button 
            className="md:hidden text-nephele-grey p-2"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 px-4">
          <div className="text-[10px] tracking-widest uppercase text-nephele-grey mb-2 px-2">Store Management</div>
          <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-nephele-white hover:bg-nephele-dim transition-colors rounded-sm">
            <Package size={16} className="text-nephele-grey" /> Products
          </Link>
          <Link to="/admin/orders" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-nephele-white hover:bg-nephele-dim transition-colors rounded-sm">
            <ShoppingCart size={16} className="text-nephele-grey" /> Orders
          </Link>
          <Link to="/admin/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-nephele-grey hover:bg-nephele-dim hover:text-nephele-white transition-colors rounded-sm">
            <Settings size={16} /> Settings & Logs
          </Link>
        </div>

        <div className="p-4 border-t border-nephele-border">
          <button onClick={onSearchOpen} className="flex items-center justify-between w-full px-3 py-2 text-sm text-nephele-grey hover:text-nephele-white hover:bg-nephele-dim transition-colors rounded-sm mb-2">
            <span className="flex items-center gap-3"><Search size={16} /> Search</span>
            <kbd className="text-[10px] bg-nephele-dim px-1.5 py-0.5">⌘K</kbd>
          </button>
          <button onClick={handleLogout} className="flex items-center justify-between w-full px-3 py-2 text-sm text-nephele-grey hover:text-red-400 hover:bg-nephele-dim transition-colors rounded-sm">
            Sign Out <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{products: any[], orders: any[]}>({products: [], orders: []});
  const [searchLoading, setSearchLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const navigate = useNavigate();

  const handleGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({products: [], orders: []});
      return;
    }
    setSearchLoading(true);
    const [products, orders] = await Promise.all([
      supabase.from('products').select('id, title, sku, price, status').ilike('title', `%${query}%`).limit(5),
      supabase.from('orders').select('id, order_number, customer_first_name, phone, status').or(`order_number.ilike.%${query}%,phone.ilike.%${query}%,customer_first_name.ilike.%${query}%`).limit(5)
    ]);
    setSearchResults({
      products: products.data || [],
      orders: orders.data || []
    });
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleGlobalSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleGlobalSearch]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const channel = supabase.channel('admin-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('synced'), 1000);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-nephele-black flex items-center justify-center font-mono text-xs text-nephele-grey">Verifying...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-nephele-black text-nephele-white overflow-hidden">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-nephele-border bg-nephele-black">
          <button 
            onClick={() => setMobileOpen(true)}
            className="text-nephele-white flex items-center gap-2 lg:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-xs text-nephele-grey hover:text-nephele-white"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Rechercher</span>
              <kbd className="text-[10px] bg-nephele-dim px-1.5 py-0.5">⌘K</kbd>
            </button>
            <div className={`flex items-center gap-1.5 text-xs ${
              syncStatus === 'synced' ? 'text-green-400' : 
              syncStatus === 'syncing' ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {syncStatus === 'synced' && <><Wifi size={12} /> Sync</>}
              {syncStatus === 'syncing' && <><RefreshCw size={12} className="animate-spin" /> Sync</>}
              {syncStatus === 'offline' && <><WifiOff size={12} /> Offline</>}
            </div>
          </div>
        </header>
        <header className="md:hidden flex items-center p-4 border-b border-nephele-border bg-nephele-black">
          <button 
            onClick={() => setMobileOpen(true)}
            className="text-nephele-white flex items-center gap-2"
          >
            <Menu size={24} />
            <span className="text-sm font-medium">Menu</span>
          </button>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </div>
      </main>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl bg-nephele-black border border-nephele-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 p-4 border-b border-nephele-border">
              <Search size={18} className="text-nephele-grey" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher produits, commandes..."
                className="flex-1 bg-transparent text-sm focus:outline-none"
                autoFocus
              />
              <kbd className="text-[10px] bg-nephele-dim px-2 py-1">ESC</kbd>
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
              {searchLoading ? (
                <div className="p-8 text-center text-nephele-grey text-sm">Recherche...</div>
              ) : searchResults.products.length === 0 && searchResults.orders.length === 0 && searchQuery ? (
                <div className="p-8 text-center text-nephele-grey text-sm">Aucun résultat</div>
              ) : (
                <>
                  {searchResults.products.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] tracking-widest uppercase text-nephele-grey px-3 py-2">Produits</p>
                      {searchResults.products.map(p => (
                        <Link 
                          key={p.id}
                          to={`/admin/products/${p.id}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-nephele-dim"
                        >
                          <div>
                            <p className="text-sm font-light">{p.title}</p>
                            <p className="text-xs text-nephele-grey font-mono">{p.sku}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-1 ${p.status === 'available' ? 'text-green-400' : 'text-nephele-grey'}`}>{p.status}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.orders.length > 0 && (
                    <div className="p-2 border-t border-nephele-border">
                      <p className="text-[10px] tracking-widest uppercase text-nephele-grey px-3 py-2">Commandes</p>
                      {searchResults.orders.map(o => (
                        <Link 
                          key={o.id}
                          to={`/admin/orders?search=${o.order_number}`}
                          onClick={() => setSearchOpen(false)}
                          className="flex items-center justify-between px-3 py-2 hover:bg-nephele-dim"
                        >
                          <div>
                            <p className="text-sm font-light">{o.customer_first_name}</p>
                            <p className="text-xs text-nephele-grey font-mono">{o.phone}</p>
                          </div>
                          <span className="text-[10px] px-2 py-1 text-nephele-grey">{o.order_number}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-3 border-t border-nephele-border flex items-center justify-between text-[10px] text-nephele-grey">
              <span><kbd className="bg-nephele-dim px-1">↵</kbd> Select <kbd className="bg-nephele-dim px-1">↑↓</kbd> Navigate</span>
              <span>Cmd+K to open</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
