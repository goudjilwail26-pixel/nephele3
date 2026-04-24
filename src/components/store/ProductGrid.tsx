import ProductCard from './ProductCard'
import type { Product } from '@/lib/types'

interface ProductGridProps {
  products: Product[]
  columns?: 3 | 4
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  const gridClass = columns === 4 
    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-8 sm:gap-x-4 sm:gap-y-12"
    : "grid grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-8 sm:gap-x-4 sm:gap-y-12"

  return (
    <div className={gridClass}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
