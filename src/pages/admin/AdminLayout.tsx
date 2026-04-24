import { Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Package, Settings, LogOut, ArrowLeft, Menu, X, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

function AdminSidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
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

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-nephele-black flex items-center justify-center font-mono text-xs text-nephele-grey">Verifying...</div>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="flex h-screen bg-nephele-black text-nephele-white overflow-hidden">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 overflow-auto flex flex-col">
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
    </div>
  );
}
