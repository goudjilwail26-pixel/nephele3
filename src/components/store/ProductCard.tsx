import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false)

  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'
  
  // Brutalist trick: if there's a second image, show on hover
  const primaryImage = product.cover_image || product.images?.[0]
  const hoverImage = product.images?.[1] || primaryImage

  return (
    <div className="group relative border border-transparent hover:border-nephele-border hover:bg-nephele-dim transition-colors pb-3">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden bg-nephele-border/10 mb-3 border border-nephele-border">
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.title}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                  hoverImage && hoverImage !== primaryImage ? "group-hover:opacity-0" : "",
                  (isSold || isReserved) && 'opacity-60 scale-100 grayscale-[0.8]'
                )}
              />
              {hoverImage && hoverImage !== primaryImage && (
                <img
                  src={hoverImage}
                  alt={product.title}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    (isSold || isReserved) && 'opacity-60 scale-100 grayscale-[0.8]'
                  )}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl text-nephele-border font-mono">?</span>
            </div>
          )}

          {/* Status Badge */}
          {(isSold || isReserved || product.is_featured) && (
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {isSold && (
                <span className="bg-nephele-white text-nephele-black font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-1 border border-nephele-black">
                  SOLD OUT
                </span>
              )}
              {isReserved && !isSold && (
                <span className="bg-nephele-grey text-nephele-black font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-1 border border-nephele-black">
                  RESERVED
                </span>
              )}
              {product.is_featured && !isSold && !isReserved && (
                <span className="bg-black/50 backdrop-blur-sm text-nephele-white font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-1 border border-nephele-border">
                  FEATURED
                </span>
              )}
            </div>
          )}
          
          {/* Bottom Right Floating Size */}
          {product.size && (
             <div className="absolute bottom-2 right-2 z-10">
                <span className="bg-nephele-black/80 backdrop-blur-sm text-nephele-white border border-nephele-border font-mono text-[9px] tracking-widest px-2 py-1 uppercase">
                  {product.size}
                </span>
             </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1.5 px-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[9px] font-mono tracking-widest uppercase text-nephele-grey truncate">
                  {product.brand?.name || 'VINTAGE'}
                </p>
              </div>
              <h3 className="text-xs uppercase font-medium tracking-wide truncate text-nephele-white">{product.title}</h3>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                setWishlisted(!wishlisted)
              }}
              className="flex-shrink-0 mt-0.5 text-nephele-grey hover:text-nephele-white transition-colors"
            >
              <Heart
                size={14}
                className={cn(wishlisted && 'fill-nephele-white text-nephele-white')}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
             <p className={cn('text-sm font-mono tracking-tighter', isSold ? 'line-through text-nephele-grey' : 'text-nephele-white')}>
              {formatPrice(product.price)}
            </p>
            {product.condition && (
               <span className="text-[8px] font-mono tracking-widest text-nephele-grey uppercase">
                 Cond: {product.condition}
               </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard
