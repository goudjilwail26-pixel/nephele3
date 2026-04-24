import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import ProductGrid from '@/components/store/ProductGrid'
import ProductFilters from '@/components/store/ProductFilters'
import type { Product, Category, Brand, ProductFilters as Filters } from '@/lib/types'

export default function ShopPage() {
  const [searchParams] = useSearchParams()
  
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

  useEffect(() => {
    async function loadShopData() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        let query = supabase
          .from('products')
          .select('*, brand:brands(id, name, slug), category:categories(id, name, slug)')
          .neq('status', 'draft')

        if (filters.category) query = query.eq('category.slug', filters.category)
        if (filters.brand) query = query.eq('brand.slug', filters.brand)
        if (filters.size) query = query.ilike('size', `%${filters.size}%`)
        if (filters.search) query = query.ilike('title', `%${filters.search}%`)
        
        // Fix routing error when trying to sort incorrectly. Let's just handle simplest ones for now.
        if (filters.sort === 'price_asc') query = query.order('price', { ascending: true })
        else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false })
        else query = query.order('created_at', { ascending: false })

        const [
          { data: prodData },
          { data: catData },
          { data: brandData }
        ] = await Promise.all([
          query.limit(48),
          supabase.from('categories').select('*').eq('is_active', true),
          supabase.from('brands').select('*').eq('is_active', true)
        ])

        if (prodData) setProducts(prodData as any)
        if (catData) setCategories(catData)
        if (brandData) setBrands(brandData)

      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }

    loadShopData()
  }, [searchParams])

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-nephele-grey mb-2">
            {products.length} pieces
          </p>
          <h1 className="greek text-4xl sm:text-5xl font-light">Shop</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <ProductFilters
              categories={categories}
              brands={brands}
              currentFilters={filters}
            />
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20 animate-pulse text-nephele-grey">
                Loading collection...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="greek text-2xl text-nephele-grey mb-2">No pieces found</p>
                <p className="text-xs text-nephele-grey">Try adjusting your filters</p>
              </div>
            ) : (
              <ProductGrid products={products} columns={3} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
