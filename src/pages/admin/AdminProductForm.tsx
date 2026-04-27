import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product, Category, Brand, ProductStatus, ProductCondition } from '@/lib/types'

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = id !== 'new'

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])

  const [formData, setFormData] = useState<Partial<Product>>({
    title: '',
    slug: '',
    sku: '',
    price: 0,
    currency: 'DZD',
    status: 'draft',
    condition: '9/10',
    size: '',
    description: '',
    cover_image: '',
    images: [],
    is_featured: false,
  })

  useEffect(() => {
    async function init() {
      // Load categories and brands
      const [catRes, brandRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_active', true),
        supabase.from('brands').select('*').eq('is_active', true)
      ])
      if (catRes.data) setCategories(catRes.data)
      if (brandRes.data) setBrands(brandRes.data)

      // Load product if editing
      if (isEditing) {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
        if (error) {
          toast.error('Failed to load product')
          navigate('/admin')
        } else if (data) {
          setFormData(data)
        }
        setFetching(false)
      }
    }
    init()
  }, [id, navigate, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : type === 'number' ? parseFloat(value) : value
    
    setFormData(prev => {
      const newData = { ...prev, [name]: val }
      // Auto-generate slug and SKU if title changes and we are not editing
      if (name === 'title' && !isEditing) {
        newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        newData.sku = `VNT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      }
      return newData
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return
      
      setUploadingImage(true)
      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 10)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath)
      
      setFormData(prev => {
        const newImages = [...(prev.images || []), data.publicUrl]
        return {
          ...prev,
          cover_image: prev.cover_image || data.publicUrl,
          images: newImages
        }
      })
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Failed to upload image. Did you create the bucket?')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        updated_at: new Date().toISOString()
      }

      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', id)
        if (error) throw error
        toast.success('Product updated successfully')
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
        toast.success('Product created successfully')
      }
      navigate('/admin')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return <div className="animate-pulse font-mono text-sm text-nephele-grey py-10">Loading catalog data...</div>

  return (
    <div className="max-w-4xl">
      <button 
        onClick={() => navigate('/admin')}
        className="text-xs text-nephele-grey hover:text-nephele-white mb-6 flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      <h1 className="greek text-3xl font-light mb-8">{isEditing ? 'Edit Piece' : 'Add New Piece'}</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-nephele-dim p-6 border border-nephele-border">
        {/* Core Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Title *</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white" placeholder="e.g. Vintage Faded Hoodie" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Slug / URL Path *</label>
            <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white text-nephele-grey" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Price (DZD) *</label>
            <input required type="number" min="0" step="100" name="price" value={formData.price} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white font-mono" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Size</label>
            <input type="text" name="size" value={formData.size} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white font-mono uppercase" placeholder="L, XL, 32" />
          </div>
        </div>

        {/* Classification */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-6 border-t border-nephele-border">
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Status</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white">
              <option value="draft">Draft (Hidden)</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold Out</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white">
              <option value="10/10">10/10 (Deadstock)</option>
              <option value="9/10">9/10 (Excellent)</option>
              <option value="8/10">8/10 (Great)</option>
              <option value="7/10">7/10 (Good)</option>
              <option value="6/10">6/10 (Fair)</option>
              <option value="vintage">Vintage Wear</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Category</label>
            <select name="category_id" value={formData.category_id || ''} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white">
              <option value="">None</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Brand</label>
            <select name="brand_id" value={formData.brand_id || ''} onChange={handleChange} className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white">
              <option value="">None / Unbranded</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {/* Media & Details */}
        <div className="space-y-6 pt-6 border-t border-nephele-border">
          <div className="space-y-4">
            <label className="text-[10px] tracking-widest uppercase text-nephele-grey block">Product Image</label>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* File Uploader */}
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  onChange={handleImageUpload} 
                  disabled={uploadingImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                />
                <div className={`flex items-center gap-2 px-6 py-3 border border-nephele-border text-xs tracking-widest uppercase transition-colors ${uploadingImage ? 'bg-nephele-dim text-nephele-grey' : 'bg-nephele-black text-nephele-white hover:bg-nephele-dim'}`}>
                  {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : <span>+ Upload Photo</span>}
                </div>
              </div>

              <span className="text-xs text-nephele-grey font-mono">OR</span>

              {/* URL Fallback */}
              <div className="flex gap-2">
                <input 
                  type="url" 
                  name="cover_image" 
                  value={formData.cover_image} 
                  onChange={handleChange} 
                  className="flex-1 bg-nephele-black border border-nephele-border px-3 py-3 text-sm focus:outline-none focus:border-nephele-white font-mono text-xs w-full" 
                  placeholder="Paste image URL for cover..." 
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter image URL to add to gallery:')
                    if (url) {
                      setFormData(prev => ({
                        ...prev,
                        cover_image: prev.cover_image || url,
                        images: [...(prev.images || []), url]
                      }))
                    }
                  }}
                  className="px-3 py-2 border border-nephele-border text-xs uppercase hover:bg-nephele-dim"
                >
                  + Add
                </button>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Image Gallery ({formData.images?.length || 0} images)</label>
              <div className="flex flex-wrap gap-2">
                {formData.cover_image && (
                  <div className="relative group">
                    <img src={formData.cover_image} alt="Cover" className="h-24 w-24 object-cover border border-nephele-border" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = (formData.images || []).filter(img => img !== formData.cover_image)
                        setFormData(prev => ({
                          ...prev,
                          cover_image: newImages[0] || '',
                          images: newImages
                        }))
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                    <span className="absolute bottom-0 left-0 bg-black text-white text-[8px] px-1">COVER</span>
                  </div>
                )}
                {(formData.images || []).filter(img => img !== formData.cover_image).map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={img} alt={`Image ${idx + 1}`} className="h-24 w-24 object-cover border border-nephele-border" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = (formData.images || []).filter(i => i !== img)
                        setFormData(prev => ({
                          ...prev,
                          images: newImages
                        }))
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs p-1 opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-nephele-grey">Tip: Upload one image, then paste more URLs above to add to gallery</p>
            </div>
          </div>

          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <label className="text-[10px] tracking-widest uppercase text-nephele-grey">Detailed Description</label>
             </div>
             <textarea 
               name="description" 
               value={formData.description || ''} 
               onChange={handleChange}
               rows={4}
               className="w-full bg-nephele-black border border-nephele-border px-3 py-2 text-sm focus:outline-none focus:border-nephele-white"
               placeholder="Describe measurements, flaws, and details..."
             />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 bg-nephele-black border-nephele-border accent-nephele-white" />
            <span className="text-[10px] tracking-widest uppercase text-nephele-white">Feature on top of feed?</span>
          </label>
        </div>

        {/* Actions */}
        <div className="pt-8 border-t border-nephele-border flex items-center justify-end gap-4">
          <button type="button" onClick={() => navigate('/admin')} className="px-6 py-2 text-xs tracking-widest uppercase text-nephele-grey hover:text-nephele-white transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="bg-nephele-white text-nephele-black px-6 py-2 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors flex items-center gap-2 font-bold disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEditing ? 'Save Changes' : 'Publish Piece'}
          </button>
        </div>
      </form>
    </div>
  )
}
