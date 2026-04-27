import type { Product } from '@/lib/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  return (
    <div className={`
      grid gap-4 sm:gap-5
      grid-cols-2 
      md:grid-cols-3 
      lg:grid-cols-4
      xl:grid-cols-4
    `}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}