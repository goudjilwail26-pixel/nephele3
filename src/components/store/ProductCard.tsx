import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShoppingBag, Eye, Zap } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [adding, setAdding] = useState(false)

  const isSold = product.status === 'sold'
  const isReserved = product.status === 'reserved'
  
  const primaryImage = product.cover_image || product.images?.[0]
  const hoverImage = product.images?.[1] || primaryImage

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSold || isReserved) return

    setAdding(true)
    
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const exists = cart.find((item: Product) => item.id === product.id)
    
    if (!exists) {
      cart.push(product)
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cart-updated'))
      toast.success('Added to cart')
    } else {
      toast.error('Already in cart')
    }
    
    setTimeout(() => setAdding(false), 500)
  }

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-nephele-border/10">
          {primaryImage ? (
            <>
              <img
                src={primaryImage}
                alt={product.title}
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-all duration-500',
                  hoverImage !== primaryImage && isHovered ? 'opacity-0 scale-105' : 'scale-100',
                  (isSold || isReserved) && 'grayscale opacity-60'
                )}
              />
              {hoverImage && hoverImage !== primaryImage && (
                <img
                  src={hoverImage}
                  alt={product.title}
                  className={cn(
                    'absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0',
                    isHovered && 'opacity-100 scale-105'
                  )}
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-nephele-dim">
              <span className="text-4xl text-nephele-border font-mono">?</span>
            </div>
          )}

          {/* Status Badges */}
          {(isSold || isReserved || product.is_featured) && (
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
              {isSold && (
                <span className="bg-nephele-white text-nephele-black text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                  SOLD
                </span>
              )}
              {isReserved && !isSold && (
                <span className="bg-nephele-grey text-nephele-black text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                  RESERVED
                </span>
              )}
              {product.is_featured && !isSold && !isReserved && (
                <span className="bg-nephele-white/90 backdrop-blur text-nephele-black text-[10px] font-bold tracking-widest uppercase px-2 py-1">
                  NEW
                </span>
              )}
            </div>
          )}

          {/* Size Badge */}
          {product.size && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-nephele-black/80 backdrop-blur text-nephele-white text-[10px] tracking-widest px-2 py-1 uppercase">
                {product.size}
              </span>
            </div>
          )}

          {/* Quick Actions - Show on Hover */}
          <div className={cn(
            'absolute bottom-0 left-0 right-0 p-3 flex gap-2 transition-all duration-300',
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          )}>
            <button
              onClick={handleQuickAdd}
              disabled={isSold || isReserved || adding}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs tracking-widest uppercase transition-all',
                isSold || isReserved 
                  ? 'bg-nephele-border text-nephele-grey cursor-not-allowed' 
                  : 'bg-nephele-white text-nephele-black hover:bg-nephele-silver'
              )}
            >
              {adding ? (
                <Zap size={14} className="animate-pulse" />
              ) : (
                <><ShoppingBag size={14} /> Add</>
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                setWishlisted(!wishlisted)
              }}
              className={cn(
                'p-2.5 border transition-colors',
                wishlisted ? 'bg-nephele-white text-nephele-black border-nephele-white' : 'bg-nephele-black/80 text-nephele-white border-nephele-border hover:bg-nephele-white hover:text-nephele-black'
              )}
            >
              <Heart size={14} className={cn(wishlisted && 'fill-current')} />
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="pt-3 space-y-1">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[9px] tracking-widest uppercase text-nephele-grey truncate">
                {product.brand?.name || 'VINTAGE'}
              </p>
              <h3 className="text-xs uppercase font-medium tracking-wide truncate text-nephele-white mt-0.5">
                {product.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className={cn('text-sm font-mono', isSold ? 'line-through text-nephele-grey' : 'text-nephele-white')}>
              {formatPrice(product.price)}
            </p>
            {product.condition && (
              <span className="text-[8px] tracking-widest text-nephele-grey uppercase">
                {product.condition}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard