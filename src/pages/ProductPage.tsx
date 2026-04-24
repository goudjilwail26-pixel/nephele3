import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import CheckoutModal from '@/components/store/CheckoutModal'
import RelatedProducts from '@/components/store/RelatedProducts'
import ProductGallery from '@/components/store/ProductGallery'
import CopyButton from '@/components/store/CopyButton'
import type { Product } from '@/lib/types'

export default function ProductPage() {
  const { slug } = useParams<{slug: string}>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      if(!slug || !isSupabaseConfigured) {
        setLoading(false)
        return
      }

      try {
        const { data } = await supabase
          .from('products')
          .select('*, brand:brands(name, slug), category:categories(name, slug)')
          .eq('slug', slug)
          .neq('status', 'draft')
          .single()

        setProduct(data as any)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [slug])

  if (loading) {
    return <div className="min-h-screen pt-32 text-center text-nephele-grey font-mono animate-pulse">Loading piece...</div>
  }

  if (!product) {
    return <div className="min-h-screen pt-32 text-center text-nephele-grey font-mono">Product not found.</div>
  }

  const isSold = product.status === 'sold'

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Gallery */}
          <ProductGallery images={(product.images?.length ? product.images : [product.cover_image].filter(Boolean)) as string[]} title={product.title} />

          {/* Info */}
          <div className="space-y-6">
            {/* Brand + Category */}
            <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase text-nephele-grey">
              {product.brand && <span>{product.brand.name}</span>}
              {product.brand && product.category && <span>·</span>}
              {product.category && <span>{product.category.name}</span>}
            </div>

            {/* Title */}
            <h1 className="greek text-3xl sm:text-4xl font-light leading-tight">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <p className={`text-2xl ${isSold ? 'line-through text-nephele-grey' : ''}`}>
                {formatPrice(product.price, product.currency || 'DZD')}
              </p>
              {isSold && (
                <span className="text-xs tracking-[0.2em] uppercase bg-nephele-dim px-3 py-1 border border-nephele-border">
                  Sold
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 border border-nephele-border p-4">
              {[
                { label: 'Condition', value: product.condition || '—' },
                { label: 'Size', value: product.size || '—' },
                { label: 'Status', value: product.status },
                { label: 'SKU', value: product.sku },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] tracking-[0.15em] uppercase text-nephele-grey mb-0.5">{label}</p>
                  <p className="text-sm font-mono">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-nephele-grey leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}

            {/* Actions */}
            {!isSold && (
              <div className="space-y-3">
                <button
                  onClick={() => setCheckoutOpen(true)}
                  className="flex items-center justify-center gap-2 w-full bg-nephele-white text-nephele-black py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors font-medium"
                >
                  Commander Maintenant
                </button>
              </div>
            )}

            {/* Copy SKU */}
            <CopyButton text={product.sku} label="Copy product code" />

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string) => (
                  <span key={tag} className="text-[10px] tracking-wider text-nephele-grey border border-nephele-border px-2 py-1">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        <RelatedProducts
          categoryId={product.category_id}
          currentProductId={product.id}
        />

        {/* Checkout Modal */}
        {product && (
          <CheckoutModal
            product={product}
            isOpen={checkoutOpen}
            onClose={() => setCheckoutOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
