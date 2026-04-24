import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import ProductGrid from '@/components/store/ProductGrid'
import ProductFilters from '@/components/store/ProductFilters'
import NewsletterSection from '@/components/store/NewsletterSection'
import Marquee from '@/components/store/Marquee'
import type { Product, Category, Brand, ProductFilters as Filters } from '@/lib/types'

export default function HomePage() {
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
    async function getData() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        let query = supabase
          .from('products')
          .select('*, brand:brands(id, name, slug), category:categories(id, name, slug)')
          .neq('status', 'draft')

        if (filters.category) query = query.eq('category.slug', filters.category)
        if (filters.brand) query = query.eq('brand.slug', filters.brand)
        if (filters.size) query = query.ilike('size', `%${filters.size}%`)
        if (filters.search) query = query.ilike('title', `%${filters.search}%`)
        
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
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [searchParams])

  return (
    <div className="pt-16 min-h-screen flex flex-col">
      <Marquee text="WELCOME • DELIVERY 58 WILLAYA" />
      
      {/* Feed Title */}
      <section className="px-4 py-8 sm:px-6 max-w-7xl mx-auto w-full flex flex-col gap-6 border-b border-nephele-border mb-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-nephele-grey mb-1">Nephele</p>
            <h1 className="greek text-3xl sm:text-5xl font-light uppercase tracking-wide">ΝΕΦΕΛΗ</h1>
          </div>
          <p className="text-[10px] sm:text-xs font-mono uppercase text-nephele-grey hidden sm:block">
            Explore {products.length > 0 ? products.length : ''} Curated Pieces
          </p>
        </div>
        <ProductFilters
          categories={categories}
          brands={brands}
          currentFilters={filters}
        />
      </section>

      {/* Main Feed */}
      <section className="pb-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center py-20 text-nephele-grey font-mono text-sm animate-pulse">
            LOADING DROP...
          </div>
        ) : products.length > 0 ? (
          <ProductGrid products={products} columns={4} />
        ) : (
          <div className="text-center py-20 text-nephele-grey font-mono text-sm border border-dashed border-nephele-border">
            NO PIECES FOUND.
          </div>
        )}
      </section>

      <div className="mt-auto">
        <NewsletterSection />
      </div>
    </div>
  )
}
