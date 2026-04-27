import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search, Filter, Eye, Phone, MessageCircle, Trash2, 
  Download, ChevronDown, X, Check, Clock, Package, 
  Truck, AlertCircle, RotateCcw, CheckSquare, Square, History
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUSES, ALGERIA_WILAYAS, type Order, type OrderStatus } from '@/lib/types'
import toast from 'react-hot-toast'

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [wilayaFilter, setWilayaFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [bulkStatus, setBulkStatus] = useState<string>('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [orderHistory, setOrderHistory] = useState<any[]>([])

  const getTodayStart = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
  }

  const getWeekStart = () => {
    const now = new Date()
    now.setDate(now.getDate() - 7)
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
  }

  const getMonthStart = () => {
    const now = new Date()
    now.setMonth(now.getMonth() - 1)
    now.setHours(0, 0, 0, 0)
    return now.toISOString()
  }

  useEffect(() => {
    loadOrders()
  }, [statusFilter, wilayaFilter, dateFilter])

  useEffect(() => {
    const qStatus = searchParams.get('status')
    const qWilaya = searchParams.get('wilaya')
    const qDate = searchParams.get('date')
    if (qStatus) setStatusFilter(qStatus)
    if (qWilaya) setWilayaFilter(qWilaya)
    if (qDate) setDateFilter(qDate)
  }, [])

  async function loadOrders() {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false })

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }
    if (wilayaFilter) {
      query = query.eq('wilaya', wilayaFilter)
    }
    if (dateFilter === 'today') {
      query = query.gte('created_at', getTodayStart())
    } else if (dateFilter === 'week') {
      query = query.gte('created_at', getWeekStart())
    } else if (dateFilter === 'month') {
      query = query.gte('created_at', getMonthStart())
    }

    const { data } = await query
    if (data) setOrders(data)
    setLoading(false)
  }

  async function handleSearch() {
    if (!search.trim()) {
      loadOrders()
      return
    }

    const searchLower = search.toLowerCase()
    const { data } = await supabase
      .from('orders')
      .select('*')
      .or(`phone.ilike.%${searchLower}%,customer_first_name.ilike.%${searchLower}%,customer_last_name.ilike.%${searchLower}%,order_number.ilike.%${searchLower}%`)
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
  }

  async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      toast.success('Statut mis à jour')
      loadOrders()
      setSelectedOrder(null)
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) return

    const { error } = await supabase.from('orders').delete().eq('id', orderId)
    
    if (error) {
      toast.error('Erreur lors de la suppression')
    } else {
      toast.success('Commande supprimée')
      loadOrders()
      setSelectedOrder(null)
    }
  }

  async function quickStatusChange(orderId: string, newStatus: OrderStatus) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      toast.success(`${newStatus}`)
      loadOrders()
    }
  }

  function toggleSelectOrder(orderId: string) {
    const newSelected = new Set(selectedOrders)
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId)
    } else {
      newSelected.add(orderId)
    }
    setSelectedOrders(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  function toggleSelectAll() {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedOrders(new Set(orders.map(o => o.id)))
      setShowBulkActions(true)
    }
  }

  async function bulkUpdateStatus() {
    if (!bulkStatus || selectedOrders.size === 0) return

    const { error } = await supabase
      .from('orders')
      .update({ status: bulkStatus, updated_at: new Date().toISOString() })
      .in('id', Array.from(selectedOrders))

    if (error) {
      toast.error('Erreur lors de la mise à jour')
    } else {
      toast.success(`${selectedOrders.size} commandes mises à jour`)
      setSelectedOrders(new Set())
      setShowBulkActions(false)
      setBulkStatus('')
      loadOrders()
    }
  }

  async function loadOrderHistory(orderId: string) {
    const { data } = await supabase
      .from('order_history')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false })
    setOrderHistory(data || [])
  }

  async function openOrderDetails(order: Order) {
    setSelectedOrder(order)
    setEditStatus(order.status)
    const { data } = await supabase
      .from('order_history')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
    setOrderHistory(data || [])
  }

  function exportCSV() {
    const headers = ['Order #', 'Date', 'Client', 'Téléphone', 'Wilaya', 'Commune', 'Produit', 'Qté', 'Total', 'Statut']
    const rows = orders.map(o => [
      o.order_number,
      new Date(o.created_at).toLocaleString('fr-DZ'),
      `${o.customer_first_name} ${o.customer_last_name}`,
      o.phone,
      o.wilaya,
      o.commune,
      o.product_name,
      o.quantity,
      o.total_price,
      o.status
    ])
    
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
      case 'Nouvelle Commande': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Confirmée': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
      case 'Préparation': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
      case 'Expédiée': return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
      case 'Livrée': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Annulée': return 'text-red-400 bg-red-400/10 border-red-400/20'
      case 'Retour': return 'text-pink-400 bg-pink-400/10 border-pink-400/20'
      default: return 'text-nephele-grey bg-nephele-dim border-nephele-border'
    }
  }

  if (loading) {
    return <div className="animate-pulse text-nephele-grey font-mono text-sm py-10">Chargement des commandes...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-nephele-grey mb-1">Gestion des commandes</p>
          <h1 className="greek text-3xl font-light">Commandes</h1>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 bg-nephele-white text-nephele-black px-4 py-2.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors"
        >
          <Download size={14} />
          Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {showBulkActions && (
          <div className="w-full flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 p-3">
            <span className="text-sm">{selectedOrders.size} sélectionné(s)</span>
            <select
              value={bulkStatus}
              onChange={e => setBulkStatus(e.target.value)}
              className="bg-nephele-dim border border-nephele-border px-3 py-1.5 text-sm"
            >
              <option value="">Changer le statut...</option>
              {ORDER_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <button
              onClick={bulkUpdateStatus}
              disabled={!bulkStatus}
              className="bg-nephele-white text-nephele-black px-4 py-1.5 text-xs uppercase disabled:opacity-50"
            >
              Appliquer
            </button>
            <button
              onClick={() => {
                setSelectedOrders(new Set())
                setShowBulkActions(false)
              }}
              className="text-nephele-grey hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nephele-grey" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Rechercher par téléphone, nom, numéro..."
            className="w-full bg-nephele-dim border border-nephele-border pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-nephele-grey"
          />
        </div>
        
        <select
          value={dateFilter}
          onChange={e => {
            setDateFilter(e.target.value)
            const params = new URLSearchParams(searchParams)
            if (e.target.value) params.set('date', e.target.value)
            else params.delete('date')
            setSearchParams(params)
          }}
          className="bg-nephele-dim border border-nephele-border px-4 py-2.5 text-sm focus:outline-none focus:border-nephele-grey"
        >
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value)
            const params = new URLSearchParams(searchParams)
            if (e.target.value) params.set('status', e.target.value)
            else params.delete('status')
            setSearchParams(params)
          }}
          className="bg-nephele-dim border border-nephele-border px-4 py-2.5 text-sm focus:outline-none focus:border-nephele-grey"
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={wilayaFilter}
          onChange={e => {
            setWilayaFilter(e.target.value)
            const params = new URLSearchParams(searchParams)
            if (e.target.value) params.set('wilaya', e.target.value)
            else params.delete('wilaya')
            setSearchParams(params)
          }}
          className="bg-nephele-dim border border-nephele-border px-4 py-2.5 text-sm focus:outline-none focus:border-nephele-grey"
        >
          <option value="">Toutes les wilayas</option>
          {ALGERIA_WILAYAS.map(w => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>

        {(statusFilter || wilayaFilter || dateFilter || search) && (
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('')
              setWilayaFilter('')
              setDateFilter('')
              setSearchParams({})
              loadOrders()
            }}
            className="p-2.5 border border-nephele-border hover:bg-nephele-dim transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Orders Table */}
      <div className="border border-nephele-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-nephele-border bg-nephele-dim">
              <th className="text-left px-4 py-3">
                <button onClick={toggleSelectAll} className="text-nephele-grey hover:text-white">
                  {selectedOrders.size === orders.length && orders.length > 0 ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal">Order #</th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal hidden md:table-cell">Date</th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal">Client</th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal hidden lg:table-cell">Wilaya</th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal hidden lg:table-cell">Produit</th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal">Qté</th>
              <th className="text-right px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal">Total</th>
              <th className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal hidden sm:table-cell">Statut</th>
              <th className="text-right px-4 py-3 text-xs tracking-[0.1em] uppercase text-nephele-grey font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={order.id} className={`border-b border-nephele-border hover:bg-nephele-dim/50 transition-colors ${idx !== orders.length - 1 ? '' : ''}`}>
                <td className="px-4 py-3">
                  <button onClick={() => toggleSelectOrder(order.id)} className="text-nephele-grey hover:text-white">
                    {selectedOrders.has(order.id) ? <CheckSquare size={14} /> : <Square size={14} />}
                  </button>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{order.order_number}</td>
                <td className="px-4 py-3 text-nephele-grey hidden md:table-cell">
                  {new Date(order.created_at).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-4 py-3">
                  <p className="font-light">{order.customer_first_name} {order.customer_last_name}</p>
                  <p className="text-xs text-nephele-grey font-mono">{order.phone}</p>
                </td>
                <td className="px-4 py-3 text-nephele-grey hidden lg:table-cell">{order.wilaya}</td>
                <td className="px-4 py-3 hidden lg:table-cell max-w-[150px] truncate">{order.product_name}</td>
                <td className="px-4 py-3 font-mono">{order.quantity}</td>
                <td className="px-4 py-3 text-right font-mono">{formatPrice(order.total_price)}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-[10px] px-2 py-1 border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <select
                      value={order.status}
                      onChange={e => quickStatusChange(order.id, e.target.value as OrderStatus)}
                      className="bg-nephele-dim/50 border border-nephele-border/50 px-2 py-1 text-[10px] focus:outline-none cursor-pointer hover:bg-nephele-dim"
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setEditStatus(order.status)
                      }}
                      className="p-2 hover:bg-nephele-dim transition-colors"
                      title="Voir détails"
                    >
                      <Eye size={14} />
                    </button>
                    <a
                      href={`tel:${order.phone}`}
                      className="p-2 hover:bg-nephele-dim transition-colors"
                      title="Appeler"
                    >
                      <Phone size={14} />
                    </a>
                    <a
                      href={`https://wa.me/${order.phone.replace(/\+/g, '').replace(/^213/, '213')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-nephele-dim transition-colors"
                      title="WhatsApp"
                    >
                      <MessageCircle size={14} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-nephele-grey text-sm">
                  Aucune commande trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-nephele-black border border-nephele-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-nephele-border">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-nephele-grey">Commande</p>
                <p className="font-mono">{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-nephele-dim">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-nephele-grey mb-1">Date</p>
                  <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleString('fr-DZ')}</p>
                </div>
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-nephele-grey mb-1">Statut</p>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full bg-nephele-dim border border-nephele-border px-3 py-2 text-sm focus:outline-none"
                  >
                    {ORDER_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-nephele-grey mb-1">Client</p>
                <p className="font-light">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                <p className="text-sm font-mono text-nephele-grey">{selectedOrder.phone}</p>
              </div>

              <div>
                <p className="text-xs tracking-[0.1em] uppercase text-nephele-grey mb-1">Adresse</p>
                <p className="text-sm">{selectedOrder.address}</p>
                <p className="text-sm text-nephele-grey">{selectedOrder.commune}, {selectedOrder.wilaya}</p>
              </div>

              <div className="bg-nephele-dim border border-nephele-border p-4">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-light">{selectedOrder.product_name}</p>
                    <p className="text-xs text-nephele-grey font-mono">{selectedOrder.product_sku}</p>
                  </div>
                  <p className="font-mono">{formatPrice(selectedOrder.unit_price)}</p>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Quantité: {selectedOrder.quantity}</span>
                  <span className="font-mono">{formatPrice(selectedOrder.total_price)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-nephele-grey mb-1">Notes</p>
                  <p className="text-sm text-nephele-grey">{selectedOrder.notes}</p>
                </div>
              )}

              {orderHistory.length > 0 && (
                <div>
                  <p className="text-xs tracking-[0.1em] uppercase text-nephele-grey mb-3 flex items-center gap-2">
                    <History size={14} /> Historique
                  </p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {orderHistory.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-nephele-grey" />
                        <span className="text-nephele-grey">{h.status}</span>
                        <span className="text-nephele-grey ml-auto">
                          {new Date(h.created_at).toLocaleString('fr-DZ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => updateOrderStatus(selectedOrder.id, editStatus as OrderStatus)}
                  className="flex-1 bg-nephele-white text-nephele-black py-3 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors"
                >
                  <Check size={14} className="inline mr-2" />
                  Mettre à jour
                </button>
                <button
                  onClick={() => deleteOrder(selectedOrder.id)}
                  className="px-4 border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors"
                >
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