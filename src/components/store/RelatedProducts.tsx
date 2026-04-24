import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import ProductGrid from './ProductGrid'
import type { Product } from '@/lib/types'

interface RelatedProductsProps {
  categoryId?: string
  brandId?: string
  currentProductId: string
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function loadRelated() {
      if (!categoryId) return

      const { data } = await supabase
        .from('products')
        .select('*, brand:brands(name, slug), category:categories(name, slug)')
        .eq('category_id', categoryId)
        .neq('id', currentProductId)
        .neq('status', 'draft')
        .limit(4)
      
      if (data) setProducts(data as any)
    }
    loadRelated()
  }, [categoryId, currentProductId])

  if (products.length === 0) return null

  return (
    <div className="mt-24 pt-12 border-t border-nephele-border">
      <h2 className="greek text-3xl font-light mb-8">Related Pieces</h2>
      <ProductGrid products={products} columns={4} />
    </div>
  )
}
