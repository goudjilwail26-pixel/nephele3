import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { useSearchParams } from 'react-router-dom'
import { Search, Eye, Phone, MessageCircle, Trash2, Download, X, Check, CheckSquare, Square } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUSES, ALGERIA_WILAYAS, type Order, type OrderStatus } from '@/lib/types'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState('')

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  useEffect(() => {
    loadOrders()
  }, [statusFilter])

  useEffect(() => {
    const qStatus = searchParams.get('status')
    if (qStatus) setStatusFilter(qStatus)
  }, [])

  async function loadOrders() {
    if (!isSupabaseConfigured) { setLoading(false); return }

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (statusFilter) query = query.eq('status', statusFilter)
    if (search) {
      query = query.or(`order_number.ilike.%${search}%,phone.ilike.%${search}%,customer_first_name.ilike.%${search}%`)
    }

    const { data } = await query
    if (data) setOrders(data)
    setLoading(false)
  }

  async function handleSearch() {
    loadOrders()
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const { error } = await supabase.from('orders').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', orderId)
    if (error) toast.error('Error updating status')
    else { toast.success('Status updated'); loadOrders() }
    setSelectedOrder(null)
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Delete this order?')) return
    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    if (error) toast.error('Error deleting')
    else { toast.success('Deleted'); loadOrders() }
    setSelectedOrder(null)
  }

  function exportCSV() {
    const headers = ['Order #', 'Date', 'Client', 'Phone', 'Wilaya', 'Product', 'Qty', 'Total', 'Status']
    const rows = orders.map(o => [o.order_number, new Date(o.created_at).toLocaleDateString(), `${o.customer_first_name} ${o.customer_last_name}`, o.phone, o.wilaya, o.product_name, o.quantity, o.total_price, o.status])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'Nouvelle Commande': return 'bg-yellow-400/10 text-yellow-400'
      case 'Confirmée': return 'bg-blue-400/10 text-blue-400'
      case 'Préparation': return 'bg-purple-400/10 text-purple-400'
      case 'Expédiée': return 'bg-orange-400/10 text-orange-400'
      case 'Livrée': return 'bg-green-400/10 text-green-400'
      case 'Annulée': return 'bg-red-400/10 text-red-400'
      default: return 'text-nephele-grey'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">Orders</h1>
          <p className="text-xs tracking-widest uppercase text-nephele-grey mt-1">{orders.length} total orders</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 border border-nephele-border px-3 py-2 text-xs uppercase hover:bg-nephele-dim/30">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nephele-grey" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search orders..."
            className="w-full bg-[#111111] border border-nephele-border/50 pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-nephele-grey"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#111111] border border-nephele-border/50 px-3 py-2.5 text-xs"
        >
          <option value="">All Status</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Orders Table */}
      <div className="border border-nephele-border/50 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#111111] border-b border-nephele-border/50">
              <th className="text-left px-4 py-3 tracking-wider uppercase text-nephele-grey">Order #</th>
              <th className="text-left px-4 py-3 tracking-wider uppercase text-nephele-grey hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 tracking-wider uppercase text-nephele-grey">Client</th>
              <th className="text-left px-4 py-3 tracking-wider uppercase text-nephele-grey hidden lg:table-cell">Wilaya</th>
              <th className="text-left px-4 py-3 tracking-wider uppercase text-nephele-grey hidden lg:table-cell">Product</th>
              <th className="text-right px-4 py-3 tracking-wider uppercase text-nephele-grey">Total</th>
              <th className="text-left px-4 py-3 tracking-wider uppercase text-nephele-grey hidden sm:table-cell">Status</th>
              <th className="text-right px-4 py-3 tracking-wider uppercase text-nephele-grey">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="border-b border-nephele-border/30 hover:bg-nephele-dim/30">
                <td className="px-4 py-3 font-mono">{order.order_number}</td>
                <td className="px-4 py-3 text-nephele-grey hidden md:table-cell">
                  {new Date(order.created_at).toLocaleDateString('en', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3">
                  <p>{order.customer_first_name} {order.customer_last_name}</p>
                  <p className="text-nephele-grey">{order.phone}</p>
                </td>
                <td className="px-4 py-3 text-nephele-grey hidden lg:table-cell">{order.wilays}</td>
                <td className="px-4 py-3 hidden lg:table-cell max-w-[120px] truncate">{order.product_name}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPrice(order.total_price)}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-[10px] px-2 py-0.5 ${getStatusColor(order.status)}`}>{order.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setSelectedOrder(order); setEditStatus(order.status); }} className="p-1.5 hover:bg-nephele-dim/50">
                      <Eye size={14} />
                    </button>
                    <a href={`tel:${order.phone}`} className="p-1.5 hover:bg-nephele-dim/50">
                      <Phone size={14} />
                    </a>
                    <a href={`https://wa.me/${order.phone.replace(/\+/g, '').replace(/^213/, '213')}`} target="_blank" className="p-1.5 hover:bg-nephele-dim/50">
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-nephele-grey text-xs tracking-wider">No orders found</div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-[#0a0a0a] border border-nephele-border w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-nephele-border/50">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-nephele-grey">Order</p>
                <p className="font-mono">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-nephele-grey mb-1">Date</p>
                  <p className="text-xs">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-widest uppercase text-nephele-grey mb-1">Status</p>
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="bg-[#111111] border border-nephele-border/50 px-2 py-1 text-xs w-full">
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-nephele-grey mb-1">Client</p>
                <p className="text-xs">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                <p className="text-xs text-nephele-grey">{selectedOrder.phone}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase text-nephele-grey mb-1">Address</p>
                <p className="text-xs">{selectedOrder.address}</p>
                <p className="text-xs text-nephele-grey">{selectedOrder.commune}, {selectedOrder.wilays}</p>
              </div>
              <div className="bg-[#111111] p-3">
                <p className="text-xs font-light">{selectedOrder.product_name}</p>
                <div className="flex justify-between mt-2 text-xs">
                  <span>Qty: {selectedOrder.quantity}</span>
                  <span className="font-mono">{formatPrice(selectedOrder.total_price)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateOrderStatus(selectedOrder.id, editStatus as OrderStatus)} className="flex-1 bg-nephele-white text-black py-2.5 text-xs uppercase font-bold hover:bg-nephele-silver">
                  Update Status
                </button>
                <button onClick={() => deleteOrder(selectedOrder.id)} className="px-3 border border-red-500/50 text-red-400 hover:bg-red-500/10">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}