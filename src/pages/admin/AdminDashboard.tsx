import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Package, CheckCircle, Clock, ShoppingCart, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 })
  const [orderStats, setOrderStats] = useState({ today: 0, revenue: 0, pending: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  useEffect(() => {
    async function loadStats() {
      const productCounts = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('products').select('id, title, sku, price, status, created_at').order('created_at', { ascending: false }).limit(6),
      ])
      
      setStats({
        total: productCounts[0].count || 0,
        available: productCounts[1].count || 0,
        sold: productCounts[2].count || 0
      })
      if (productCounts[3].data) setRecent(productCounts[3].data)

      const orderCounts = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('total_price').gte('created_at', todayStart.toISOString()),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Nouvelle Commande'),
      ])

      setOrderStats({
        today: orderCounts[0].count || 0,
        revenue: orderCounts[1].data?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0,
        pending: orderCounts[2].count || 0
      })
      
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) return <div className="animate-pulse text-nephele-grey font-mono text-sm py-10">Syncing database metrics...</div>

  const statCards = [
    { label: 'Total Scanned', value: stats.total, icon: Package, color: 'text-nephele-silver' },
    { label: 'Live Available', value: stats.available, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Sold & Archived', value: stats.sold, icon: Package, color: 'text-nephele-grey' },
  ]

  const orderCards = [
    { label: 'Commandes aujourd\'hui', value: orderStats.today, icon: ShoppingCart, color: 'text-yellow-400' },
    { label: 'Revenus aujourd\'hui', value: formatPrice(orderStats.revenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'En attente', value: orderStats.pending, icon: Clock, color: 'text-orange-400' },
  ]

  return (
    <div className="space-y-12">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-nephele-grey mb-1">Administrative Overview</p>
        <h1 className="greek text-3xl font-light">Inventory Hub</h1>
      </div>

      {/* Order Stats */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-4 flex items-center gap-2">
          <ShoppingCart size={14} /> Commandes
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {orderCards.map((stat, idx) => (
            <Link key={idx} to="/admin/orders" className="bg-nephele-dim border border-nephele-border p-5 rounded-sm hover:bg-nephele-dim/70 transition-colors">
              <stat.icon className={`${stat.color} mb-4`} size={20} />
              <p className="text-3xl font-light mb-1">{stat.value}</p>
              <p className="text-[10px] tracking-[0.1em] text-nephele-grey uppercase">{stat.label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Product Stats */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-4 flex items-center gap-2">
          <Package size={14} /> Produits
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((stat, idx) => (
            <div key={idx} className="bg-nephele-dim border border-nephele-border p-5 rounded-sm">
              <stat.icon className={`${stat.color} mb-4`} size={20} />
              <p className="text-3xl font-light mb-1">{stat.value}</p>
              <p className="text-[10px] tracking-[0.1em] text-nephele-grey uppercase">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <Link 
          to="/admin/products/new"
          className="bg-nephele-white text-nephele-black px-6 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors font-bold"
        >
          + Draft New Piece
        </Link>
        <Link 
          to="/admin/orders"
          className="border border-nephele-border px-6 py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-dim transition-colors"
        >
          Voir les commandes
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-4 border-b border-nephele-border pb-2">Recent Catalog Additions</h2>
        <div className="border border-nephele-border bg-nephele-black mt-4">
          {recent.map((p, i) => (
            <div key={p.id} className={`flex items-center justify-between px-5 py-4 text-sm ${i !== recent.length - 1 ? 'border-b border-nephele-border' : ''} hover:bg-nephele-dim transition-colors`}>
              <div className="flex-1">
                <Link to={`/admin/products/${p.id}`} className="font-light mb-1 hover:text-nephele-grey transition-colors block">{p.title}</Link>
                <div className="flex items-center gap-3 text-[10px] uppercase font-mono text-nephele-grey">
                  <span>{p.sku}</span>
                  <span>|</span>
                  <span>{formatPrice(p.price)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`tracking-widest uppercase text-[10px] px-2 py-1 border hidden sm:block ${
                  p.status === 'available' ? 'text-green-400 border-green-400/20 bg-green-400/5' : 
                  p.status === 'sold' ? 'text-nephele-grey border-nephele-grey/20 bg-nephele-dim' : 
                  'text-yellow-400 border-yellow-400/20 bg-yellow-400/5'
                }`}>
                  {p.status}
                </span>
                <Link to={`/admin/products/${p.id}`} className="text-[10px] tracking-widest uppercase text-nephele-grey hover:text-nephele-white px-3 py-1.5 border border-nephele-border">
                  Edit
                </Link>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="px-5 py-8 text-center text-xs text-nephele-grey font-mono">No items found in the database.</div>
          )}
        </div>
      </div>
    </div>
  )
}
