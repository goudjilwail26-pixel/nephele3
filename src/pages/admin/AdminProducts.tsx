import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Link } from 'react-router-dom'
import { Search, Package, CheckCircle, XCircle, Clock, AlertTriangle, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    let query = supabase.from('products').select('*').order('created_at', { ascending: false })
    if (statusFilter !== 'all') query = query.eq('status', statusFilter)
    if (search) query = query.ilike('title', `%${search}%`)
    const { data } = await query
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [statusFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', deleteId)
    if (error) {
      toast.error('Failed to delete product')
    } else {
      toast.success('Product deleted')
      setProducts(prev => prev.filter(p => p.id !== deleteId))
    }
    setDeleteId(null)
    setDeleting(false)
  }

  const statusFilters = [
    { value: 'all', label: 'All', icon: Package },
    { value: 'available', label: 'Available', icon: CheckCircle },
    { value: 'sold', label: 'Sold', icon: XCircle },
    { value: 'reserved', label: 'Reserved', icon: Clock },
    { value: 'draft', label: 'Draft', icon: AlertTriangle },
  ]

  return (
    <div className="max-w-6xl">
      <Link to="/admin" className="text-xs text-nephele-grey hover:text-nephele-white mb-6 flex items-center gap-2 transition-colors">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="greek text-3xl font-light">Manage Products</h1>
        <Link
          to="/admin/products/new"
          className="bg-nephele-white text-nephele-black px-4 py-2 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors font-bold"
        >
          + Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nephele-grey" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProducts()}
            placeholder="Search products..."
            className="w-full bg-nephele-black border border-nephele-border pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-nephele-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[10px] tracking-widest uppercase border transition-colors ${
                statusFilter === f.value
                  ? 'bg-nephele-white text-nephele-black border-nephele-white'
                  : 'border-nephele-border text-nephele-grey hover:text-nephele-white hover:border-nephele-grey'
              }`}
            >
              <f.icon size={12} /> {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="animate-pulse font-mono text-sm text-nephele-grey py-10">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-nephele-border">
          <Package size={40} className="mx-auto text-nephele-grey mb-4" />
          <p className="text-sm text-nephele-grey">No products found</p>
          {search && (
            <button onClick={() => { setSearch(''); setStatusFilter('all') }} className="text-xs text-nephele-white underline mt-2">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="border border-nephele-border bg-nephele-black">
          {products.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 px-5 py-4 text-sm ${i !== products.length - 1 ? 'border-b border-nephele-border' : ''} hover:bg-nephele-dim transition-colors`}
            >
              {p.cover_image ? (
                <img src={p.cover_image} alt={p.title} className="h-12 w-12 object-cover border border-nephele-border flex-shrink-0" />
              ) : (
                <div className="h-12 w-12 border border-nephele-border flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-nephele-grey" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/admin/products/${p.id}`} className="font-light truncate hover:text-nephele-grey transition-colors block">
                  {p.title}
                </Link>
                <div className="flex items-center gap-3 text-[10px] uppercase font-mono text-nephele-grey mt-0.5">
                  <span>{p.sku}</span>
                  <span>|</span>
                  <span>{formatPrice(p.price)}</span>
                  {p.size && <><span>|</span><span>{p.size}</span></>}
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 uppercase tracking-wider border hidden sm:block ${
                p.status === 'available' ? 'text-green-400 border-green-400/20 bg-green-400/5' :
                p.status === 'sold' ? 'text-nephele-grey border-nephele-grey/20 bg-nephele-dim' :
                p.status === 'reserved' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' :
                'text-nephele-grey border-nephele-grey/20 bg-nephele-dim'
              }`}>
                {p.status}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/products/${p.id}`}
                  className="p-2 text-nephele-grey hover:text-nephele-white border border-nephele-border hover:bg-nephele-dim transition-colors"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => setDeleteId(p.id)}
                  className="p-2 text-nephele-grey hover:text-red-400 border border-nephele-border hover:bg-red-400/5 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-nephele-black border border-nephele-border p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-light mb-2">Delete Product</h3>
            <p className="text-sm text-nephele-grey mb-6">Are you sure? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-xs uppercase tracking-wider border border-nephele-border hover:bg-nephele-dim transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-400/20 hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
