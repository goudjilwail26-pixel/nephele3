import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Package, CheckCircle, Clock, ShoppingCart, DollarSign, TrendingUp, TrendingDown, ArrowRight, BarChart3, Eye, Heart, Flame } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 })
  const [orderStats, setOrderStats] = useState({ today: 0, revenue: 0, pending: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [chartData, setChartData] = useState<{ date: string; orders: number; revenue: number }[]>([])
  const [monthStats, setMonthStats] = useState({ orders: 0, revenue: 0 })
  const [totalViews, setTotalViews] = useState(0)
  const [totalFavorites, setTotalFavorites] = useState(0)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const getDateRange = (days: number) => {
    const start = new Date()
    start.setDate(start.getDate() - days)
    start.setHours(0, 0, 0, 0)
    return start.toISOString()
  }

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

      const statusPromises = ORDER_STATUSES.map(status => 
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', status)
      )
      const statusResults = await Promise.all(statusPromises)
      const counts: Record<string, number> = {}
      ORDER_STATUSES.forEach((status, idx) => {
        counts[status] = statusResults[idx].count || 0
      })
      setStatusCounts(counts)

      const last7Days: { date: string; orders: number; revenue: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayStart = new Date(d)
        dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(d)
        dayEnd.setHours(23, 59, 59, 999)
        
        const [dayOrders, dayRevenue] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', dayStart.toISOString()).lte('created_at', dayEnd.toISOString()),
          supabase.from('orders').select('total_price').gte('created_at', dayStart.toISOString()).lte('created_at', dayEnd.toISOString())
        ])
        
        last7Days.push({
          date: d.toLocaleDateString('fr-DZ', { weekday: 'short' }),
          orders: dayOrders.count || 0,
          revenue: dayRevenue.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
        })
      }
      setChartData(last7Days)

      const monthOrders = await supabase.from('orders').select('total_price', { count: 'exact', head: true }).gte('created_at', getDateRange(30))
      const monthRevenue = await supabase.from('orders').select('total_price').gte('created_at', getDateRange(30))
      setMonthStats({
        orders: monthOrders.count || 0,
        revenue: monthRevenue.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0
      })

      const analytics = await supabase.from('products').select('views, favorites')
      const views = analytics.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0
      const favs = analytics.data?.reduce((sum, p) => sum + (p.favorites || 0), 0) || 0
      setTotalViews(views)
      setTotalFavorites(favs)
      
      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) return <div className="animate-pulse text-nephele-grey font-mono text-sm py-10">Syncing database metrics...</div>

  const maxChartOrders = Math.max(...chartData.map(d => d.orders), 1)

  const statCards = [
    { label: 'Total Scanned', value: stats.total, icon: Package, color: 'text-nephele-silver' },
    { label: 'Live Available', value: stats.available, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Sold & Archived', value: stats.sold, icon: Package, color: 'text-nephele-grey' },
  ]

  const orderCards = [
    { label: "Commandes aujourd'hui", value: orderStats.today, icon: ShoppingCart, color: 'text-yellow-400' },
    { label: "Revenus aujourd'hui", value: formatPrice(orderStats.revenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'En attente', value: orderStats.pending, icon: Clock, color: 'text-orange-400' },
  ]

  const analyticsCards = [
    { label: 'Total Vues', value: totalViews, icon: Eye, color: 'text-blue-400' },
    { label: 'Favoris', value: totalFavorites, icon: Heart, color: 'text-pink-400' },
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

      {/* 7-Day Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-nephele-dim border border-nephele-border p-5 rounded-sm">
          <h2 className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-6 flex items-center gap-2">
            <BarChart3 size={14} /> 7 derniers jours
          </h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {chartData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <span className="text-[10px] font-mono text-nephele-grey">{day.orders}</span>
                  <div 
                    className="w-full bg-yellow-400/60 hover:bg-yellow-400 transition-colors rounded-t-sm"
                    style={{ height: `${(day.orders / maxChartOrders) * 80}px`, minHeight: day.orders > 0 ? '4px' : 0 }}
                  />
                </div>
                <span className="text-[10px] uppercase text-nephele-grey">{day.date}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-nephele-border flex justify-between items-center">
            <div>
              <p className="text-xs text-nephele-grey uppercase tracking-wider">Ce mois</p>
              <p className="text-2xl font-light">{monthStats.orders} commandes</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-nephele-grey uppercase tracking-wider">Revenus 30j</p>
              <p className="text-2xl font-light text-green-400">{formatPrice(monthStats.revenue)}</p>
            </div>
          </div>
        </div>

        {/* Status Overview */}
        <div className="bg-nephele-dim border border-nephele-border p-5 rounded-sm">
          <h2 className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-4 flex items-center gap-2">
            <Package size={14} /> Statut des commandes
          </h2>
          <div className="space-y-2">
            {ORDER_STATUSES.map(status => (
              <Link 
                key={status}
                to={`/admin/orders?status=${encodeURIComponent(status)}`}
                className="flex items-center justify-between p-3 border border-nephele-border hover:bg-nephele-black/50 transition-colors"
              >
                <span className="text-sm">{status}</span>
                <span className={`text-xs px-2 py-1 ${
                  status === 'Nouvelle Commande' ? 'bg-yellow-400/10 text-yellow-400' :
                  status === 'Confirmée' ? 'bg-blue-400/10 text-blue-400' :
                  status === 'Préparation' ? 'bg-purple-400/10 text-purple-400' :
                  status === 'Expédiée' ? 'bg-orange-400/10 text-orange-400' :
                  status === 'Livrée' ? 'bg-green-400/10 text-green-400' :
                  status === 'Annulée' ? 'bg-red-400/10 text-red-400' :
                  'bg-pink-400/10 text-pink-400'
                }`}>
                  {statusCounts[status] || 0}
                </span>
              </Link>
            ))}
          </div>
          <Link 
            to="/admin/orders" 
            className="mt-4 flex items-center justify-center gap-2 text-xs tracking-[0.2em] uppercase text-nephele-grey hover:text-nephele-white transition-colors"
          >
            Voir toutes les commandes <ArrowRight size={12} />
          </Link>
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

      {/* Analytics */}
      <div>
        <h2 className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-4 flex items-center gap-2">
          <Flame size={14} /> Analytics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsCards.map((stat, idx) => (
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
