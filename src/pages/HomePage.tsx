import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import ProductGrid from '@/components/store/ProductGrid'
import ProductFilters from '@/components/store/ProductFilters'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SkeletonGrid } from '@/components/store/Skeleton'
import type { Product, Category, Brand, ProductFilters as Filters } from '@/lib/types'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  
  const filters: Filters = {
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    size: searchParams.get('size') || undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as Filters['sort']) || 'newest',
  }

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    async function getData() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        let query = supabase
          .from('products')
          .select('*, brand:brands(id, name, slug), category:categories(id, name, slug)', { count: 'exact' })
          .eq('status', 'available')

        if (filters.category) query = query.eq('category.slug', filters.category)
        if (filters.brand) query = query.eq('brand.slug', filters.brand)
        if (filters.size) query = query.ilike('size', `%${filters.size}%`)
        if (filters.search) query = query.ilike('title', `%${filters.search}%`)
        
        if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
        else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
        else query = query.order('created_at', { ascending: false })

        const [{ data: prodData, count }, { data: catData }, { data: brandData }] = await Promise.all([
          query.limit(48),
          supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
          supabase.from('brands').select('*').eq('is_active', true)
        ])

        if (prodData) {
          setProducts(prodData as any)
          setTotalCount(count || 0)
        }
        if (catData) setCategories(catData)
        if (brandData) setBrands(brandData)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [searchParams])

  const hasActiveFilters = filters.category || filters.brand || filters.size || filters.search || filters.sort !== 'newest'

  return (
    <div className="min-h-screen">
      {/* Hero Section - Minimal */}
      <section className="pt-20 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center py-8 sm:py-12">
            <h1 className="text-4xl sm:text-6xl font-light tracking-wider mb-3">ΝΕΦΕΛΗ</h1>
            <p className="text-xs tracking-[0.3em] uppercase text-nephele-grey mb-6">Curated Vintage & Luxury</p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-8 text-xs text-nephele-grey">
              <span>{totalCount} Pieces</span>
              <span>•</span>
              <span>58 Wilayas Delivery</span>
              <span>•</span>
              <span>COD Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-14 sm:top-16 z-40 bg-nephele-black/95 backdrop-blur-sm border-y border-nephele-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-xs tracking-widest uppercase hover:text-nephele-white"
            >
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-nephele-white rounded-full" />
              )}
              {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            <div className="flex items-center gap-4">
              <span className="text-xs text-nephele-grey hidden sm:block">
                {totalCount} products
              </span>
              
              <select
                value={filters.sort || 'newest'}
                onChange={e => {
                  const params = new URLSearchParams(searchParams)
                  params.set('sort', e.target.value)
                  setSearchParams(params)
                }}
                className="bg-transparent text-xs tracking-wider uppercase border-none focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="pt-4 mt-4 border-t border-nephele-border">
<ProductFilters
          categories={categories}
          brands={brands}
        />
              {hasActiveFilters && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="mt-4 text-xs text-nephele-grey hover:text-nephele-white"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <SkeletonGrid count={8} />
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="text-center py-20 border border-dashed border-nephele-border">
              <p className="text-nephele-grey mb-4">No products found</p>
              {hasActiveFilters && (
                <button
                  onClick={() => setSearchParams(new URLSearchParams())}
                  className="text-xs underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-4 py-12 border-t border-nephele-border">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-2">Questions?</p>
          <Link to="/contact" className="text-sm hover:underline">Contact Us</Link>
        </div>
      </section>
    </div>
  )
}