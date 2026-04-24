import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import CategoryGrid from '@/components/store/CategoryGrid'
import type { Category } from '@/lib/types'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('display_order')

        if (data) setCategories(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  return (
    <div className="pt-24 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-nephele-grey mb-2">Browse By</p>
          <h1 className="greek text-4xl sm:text-5xl font-light">Categories</h1>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-nephele-grey font-mono text-sm">
            Loading...
          </div>
        ) : categories.length > 0 ? (
          <CategoryGrid categories={categories} />
        ) : (
          <div className="text-center py-20 text-nephele-grey font-mono text-sm">
            No categories available.
          </div>
        )}
      </div>
    </div>
  )
}
