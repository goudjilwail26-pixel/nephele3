import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowRight, Eye, Heart, BarChart3, AlertTriangle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUSES } from '@/lib/types'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, available: 0, sold: 0 })
  const [orderStats, setOrderStats] = useState({ today: 0, revenue: 0, pending: 0 })
  const [recent, setRecent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})
  const [chartData, setChartData] = useState<{ date: string; orders: number }[]>([])
  const [monthStats, setMonthStats] = useState({ orders: 0, revenue: 0 })
  const [totalViews, setTotalViews] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)

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
      const [products, orders, counts] = await Promise.all([
        Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available'),
          supabase.from('products').select('id, title, sku, price, status, created_at').order('created_at', { ascending: false }).limit(5),
        ]),
        Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
          supabase.from('orders').select('total_price').gte('created_at', todayStart.toISOString()),
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Nouvelle Commande'),
        ]),
        Promise.all(ORDER_STATUSES.map(status => 
          supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', status)
        ))
      ])

      setStats({
        total: products[0].count || 0,
        available: products[1].count || 0,
        sold: (products[0].count || 0) - (products[1].count || 0)
      })
      if (products[2].data) setRecent(products[2].data)

      setOrderStats({
        today: orders[0].count || 0,
        revenue: orders[1].data?.reduce((s, o) => s + (o.total_price || 0), 0) || 0,
        pending: orders[2].count || 0
      })

      const sc: Record<string, number> = {}
      ORDER_STATUSES.forEach((status, idx) => { sc[status] = counts[idx].count || 0 })
      setStatusCounts(sc)

      const last7: { date: string; orders: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dayStart = new Date(d); dayStart.setHours(0, 0, 0, 0)
        const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999)
        const result = await supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', dayStart.toISOString()).lte('created_at', dayEnd.toISOString())
        last7.push({
          date: d.toLocaleDateString('en', { weekday: 'short' }),
          orders: result.count || 0
        })
      }
      setChartData(last7)

      const [monthO, monthR] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', getDateRange(30)),
        supabase.from('orders').select('total_price').gte('created_at', getDateRange(30))
      ])
      setMonthStats({ orders: monthO.count || 0, revenue: monthR.data?.reduce((s, o) => s + (o.total_price || 0), 0) || 0 })

      const analytics = await supabase.from('products').select('views, favorites')
      setTotalViews(analytics.data?.reduce((s, p) => s + (p.views || 0), 0) || 0)

      const lowStock = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'available')
      setLowStockCount(lowStock.count || 0)

      setLoading(false)
    }
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xs tracking-widest uppercase text-nephele-grey">Loading stats...</div>
      </div>
    )
  }

  const statCards = [
    { label: "Today's Orders", value: orderStats.today, icon: ShoppingCart, color: 'text-yellow-400' },
    { label: "Today's Revenue", value: formatPrice(orderStats.revenue), icon: DollarSign, color: 'text-green-400' },
    { label: 'Pending', value: orderStats.pending, icon: AlertTriangle, color: 'text-orange-400' },
  ]

  const productCards = [
    { label: 'Total Products', value: stats.total, icon: Package, color: 'text-nephele-white' },
    { label: 'Available', value: stats.available, icon: Package, color: 'text-green-400' },
    { label: 'Sold', value: stats.sold, icon: Package, color: 'text-nephele-grey' },
  ]

  const maxOrders = Math.max(...chartData.map(d => d.orders), 1)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-light">Dashboard</h1>
        <p className="text-xs tracking-widest uppercase text-nephele-grey mt-1">Welcome back</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-[#111111] border border-nephele-border/50 p-4">
            <stat.icon className={stat.color} size={18} />
            <p className="text-2xl font-light mt-3">{stat.value}</p>
            <p className="text-[10px] tracking-widest uppercase text-nephele-grey mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {productCards.map((stat, idx) => (
          <div key={idx} className="bg-[#111111] border border-nephele-border/50 p-4">
            <stat.icon className={stat.color} size={18} />
            <p className="text-2xl font-light mt-3">{stat.value}</p>
            <p className="text-[10px] tracking-widest uppercase text-nephele-grey mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-nephele-border/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs tracking-widest uppercase text-nephele-grey">Orders (7 days)</h2>
            <span className="text-xs text-nephele-grey">{monthStats.orders} this month</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {chartData.map((day, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-[10px] text-nephele-grey">{day.orders}</span>
                  <div 
                    className="w-full bg-yellow-400/60 rounded-sm"
                    style={{ height: `${(day.orders / maxOrders) * 60}px`, minHeight: day.orders > 0 ? '4px' : 0 }}
                  />
                </div>
                <span className="text-[9px] uppercase text-nephele-grey">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] border border-nephele-border/50 p-5">
          <h2 className="text-xs tracking-widest uppercase text-nephele-grey mb-4">Order Status</h2>
          <div className="space-y-2">
            {ORDER_STATUSES.map(status => (
              <Link 
                key={status}
                to={`/admin/orders?status=${encodeURIComponent(status)}`}
                className="flex items-center justify-between p-2 hover:bg-nephele-dim/30 transition-colors"
              >
                <span className="text-xs">{status}</span>
                <span className={`text-xs px-2 py-0.5 ${
                  status === 'Nouvelle Commande' ? 'bg-yellow-400/10 text-yellow-400' :
                  status === 'Livrée' ? 'bg-green-400/10 text-green-400' :
                  status === 'Annulée' ? 'bg-red-400/10 text-red-400' :
                  'text-nephele-grey'
                }`}>
                  {statusCounts[status] || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link 
          to="/admin/products/new"
          className="flex items-center gap-2 bg-nephele-white text-black px-4 py-2.5 text-xs tracking-widest uppercase font-bold hover:bg-nephele-silver transition-colors"
        >
          <Plus size={14} /> Add Product
        </Link>
        <Link 
          to="/admin/orders"
          className="flex items-center gap-2 border border-nephele-border px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-nephele-dim/30 transition-colors"
        >
          View Orders <ArrowRight size={14} />
        </Link>
        <Link 
          to="/admin/import"
          className="flex items-center gap-2 border border-nephele-border px-4 py-2.5 text-xs tracking-widest uppercase hover:bg-nephele-dim/30 transition-colors"
        >
          Import CSV
        </Link>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
          <AlertTriangle size={16} />
          <span className="text-xs">{lowStockCount} products low on stock</span>
        </div>
      )}

      {/* Recent Products */}
      <div>
        <h2 className="text-xs tracking-widest uppercase text-nephele-grey mb-4">Recent Products</h2>
        <div className="border border-nephele-border/50">
          {recent.map((p, i) => (
            <div 
              key={p.id} 
              className={`flex items-center justify-between px-4 py-3 ${i !== recent.length - 1 ? 'border-b border-nephele-border/30' : ''} hover:bg-nephele-dim/30 transition-colors`}
            >
              <Link to={`/admin/products/${p.id}`} className="text-xs hover:text-nephele-grey">
                {p.title}
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-nephele-grey font-mono">{p.sku}</span>
                <span className={`text-[9px] px-1.5 py-0.5 ${
                  p.status === 'available' ? 'bg-green-400/10 text-green-400' : 
                  'bg-nephele-dim text-nephele-grey'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}