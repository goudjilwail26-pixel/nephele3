import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Package, Settings, LogOut, ArrowLeft, Menu, X, ShoppingCart, Search, Wifi, RefreshCw, BarChart3, Users, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

function AdminSidebar({ mobileOpen, setMobileOpen, onSearchOpen }: { mobileOpen: boolean, setMobileOpen: (v: boolean) => void, onSearchOpen: () => void }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  const navItems = [
    { to: '/admin', icon: Package, label: 'Dashboard', exact: true },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/products/new', icon: Package, label: 'Add Product' },
    { to: '/admin/import', icon: Mail, label: 'Import CSV' },
  ]

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-56 border-r border-nephele-border bg-[#0a0a0a] flex flex-col transform transition-transform duration-300 md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-5 border-b border-nephele-border">
          <Link to="/" className="flex items-center gap-2 text-xs text-nephele-grey hover:text-nephele-white mb-4 transition-colors">
            <ArrowLeft size={12} /> Back to Store
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xl">☁️</span>
            <div>
              <p className="text-xs tracking-widest uppercase text-nephele-grey">Admin</p>
              <p className="text-sm font-light">Nephele</p>
            </div>
          </div>
          <button 
            className="md:hidden absolute top-5 right-5 text-nephele-grey p-1"
            onClick={() => setMobileOpen(false)}
          >
            <X size={18} />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 text-xs tracking-wider uppercase text-nephele-grey hover:text-nephele-white hover:bg-nephele-dim/30 transition-colors rounded-sm"
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-nephele-border space-y-1">
          <button 
            onClick={onSearchOpen}
            className="flex items-center justify-between w-full px-3 py-2.5 text-xs tracking-wider uppercase text-nephele-grey hover:text-nephele-white hover:bg-nephele-dim/30 transition-colors rounded-sm"
          >
            <span className="flex items-center gap-3"><Search size={14} /> Search</span>
            <kbd className="text-[9px] bg-nephele-dim px-1.5">⌘K</kbd>
          </button>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-between w-full px-3 py-2.5 text-xs tracking-wider uppercase text-nephele-grey hover:text-red-400 hover:bg-nephele-dim/30 transition-colors rounded-sm"
          >
            <span className="flex items-center gap-3"><LogOut size={14} /> Logout</span>
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
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing'>('synced');

  const handleGlobalSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({products: [], orders: []});
      return;
    }
    setSearchLoading(true);
    const [products, orders] = await Promise.all([
      supabase.from('products').select('id, title, sku, price, status').ilike('title', `%${query}%`).limit(5),
      supabase.from('orders').select('id, order_number, customer_first_name, phone, status').or(`order_number.ilike.%${query}%,phone.ilike.%${query}%`).limit(5)
    ]);
    setSearchResults({ products: products.data || [], orders: orders.data || [] });
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-xs tracking-widest uppercase text-nephele-grey">Loading...</div>
    </div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-nephele-white overflow-hidden">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} onSearchOpen={() => setSearchOpen(true)} />
      <main className="flex-1 overflow-auto flex flex-col">
        <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-nephele-border/50 bg-[#0a0a0a]">
          <button 
            onClick={() => setMobileOpen(true)}
            className="text-nephele-white lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-xs text-nephele-grey hover:text-nephele-white"
            >
              <Search size={14} />
              <kbd className="text-[9px] bg-nephele-dim px-1.5 py-0.5">⌘K</kbd>
            </button>
            <div className={syncStatus === 'synced' ? 'text-green-400' : 'text-yellow-400'}>
              {syncStatus === 'synced' ? <Wifi size={12} /> : <RefreshCw size={12} className="animate-spin" />}
            </div>
          </div>
        </header>
        <header className="md:hidden flex items-center justify-between p-4 border-b border-nephele-border/50 bg-[#0a0a0a]">
          <button onClick={() => setMobileOpen(true)} className="text-nephele-white">
            <Menu size={20} />
          </button>
          <span className="text-sm">☁️ Nephele Admin</span>
          <div className="w-5" />
        </header>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80" onClick={() => setSearchOpen(false)}>
          <div className="max-w-lg mx-auto mt-20 px-4" onClick={e => e.stopPropagation()}>
            <div className="bg-[#0a0a0a] border border-nephele-border">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-nephele-border/50">
                <Search size={16} className="text-nephele-grey" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, orders..."
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  autoFocus
                />
                <kbd className="text-[9px] bg-nephele-dim px-1.5 py-0.5">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-6 text-center text-nephele-grey text-xs tracking-wider">Searching...</div>
                ) : searchResults.products.length === 0 && searchResults.orders.length === 0 && searchQuery ? (
                  <div className="p-6 text-center text-nephele-grey text-xs tracking-wider">No results found</div>
                ) : (
                  <>
                    {searchResults.products.length > 0 && (
                      <div className="p-2">
                        <p className="text-[10px] tracking-widest uppercase text-nephele-grey px-2 py-1">Products</p>
                        {searchResults.products.map(p => (
                          <Link 
                            key={p.id}
                            to={`/admin/products/${p.id}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-2 py-2 hover:bg-nephele-dim/30"
                          >
                            <span className="text-xs">{p.title}</span>
                            <span className="text-[10px] text-nephele-grey">{p.sku}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {searchResults.orders.length > 0 && (
                      <div className="p-2 border-t border-nephele-border/30">
                        <p className="text-[10px] tracking-widest uppercase text-nephele-grey px-2 py-1">Orders</p>
                        {searchResults.orders.map(o => (
                          <Link 
                            key={o.id}
                            to={`/admin/orders?search=${o.order_number}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center justify-between px-2 py-2 hover:bg-nephele-dim/30"
                          >
                            <span className="text-xs">{o.order_number}</span>
                            <span className="text-[10px] text-nephele-grey">{o.customer_first_name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}