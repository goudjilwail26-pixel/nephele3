import { Link } from 'react-router-dom'
import type { Category } from '@/lib/types'

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/shop?category=${category.slug}`}
          className="group relative block aspect-[4/3] overflow-hidden bg-nephele-dim"
        >
          {category.image_url ? (
            <img
              src={category.image_url}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40"
            />
          ) : (
             <div className="absolute inset-0 flex items-center justify-center">
              <span className="greek text-4xl text-nephele-border opacity-20 group-hover:scale-110 transition-transform">ν</span>
            </div>
          )}
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <h3 className="greek text-3xl font-light mb-2">{category.name}</h3>
            {category.description && (
              <p className="text-xs text-nephele-grey max-w-xs">{category.description}</p>
            )}
            <span className="mt-4 text-[10px] tracking-[0.2em] uppercase border-b border-transparent group-hover:border-nephele-white transition-colors pb-0.5">
              Explore
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
