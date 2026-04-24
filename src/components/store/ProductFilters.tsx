import { Link, useNavigate } from 'react-router-dom'
import type { Category, Brand, ProductFilters as Filters } from '@/lib/types'

interface ProductFiltersProps {
  categories: Category[]
  brands: Brand[]
  currentFilters: Filters
}

export default function ProductFilters({ categories, brands, currentFilters }: ProductFiltersProps) {
  const navigate = useNavigate()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value === '') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    navigate(`?${params.toString()}`)
  }

  const headingClass = "text-[10px] tracking-[0.2em] uppercase text-nephele-grey mb-3 block"
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex-1 w-full sm:w-auto">
        <ul className="flex flex-row flex-wrap gap-x-6 gap-y-2">
          <li>
            <button 
              onClick={() => updateParam('category', '')}
              className={`text-xs sm:text-sm font-mono tracking-widest uppercase ${!currentFilters.category ? 'text-nephele-white border-b border-nephele-white' : 'text-nephele-grey border-b border-transparent'} hover:text-nephele-white pb-0.5`}
            >
              All
            </button>
          </li>
          {categories.map(c => (
            <li key={c.id}>
              <button 
                onClick={() => updateParam('category', c.slug)}
                className={`text-xs sm:text-sm font-mono tracking-widest uppercase ${currentFilters.category === c.slug ? 'text-nephele-white border-b border-nephele-white' : 'text-nephele-grey border-b border-transparent'} hover:text-nephele-white pb-0.5`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex-none w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-nephele-border">
        <select 
          value={currentFilters.sort || 'newest'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="w-full sm:w-auto bg-nephele-black font-mono uppercase tracking-widest text-[10px] border border-nephele-border px-3 py-2 text-nephele-white focus:outline-none focus:border-nephele-grey transition-colors cursor-pointer"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Sort: Price (Low to High)</option>
          <option value="price_desc">Sort: Price (High to Low)</option>
        </select>
      </div>
    </div>
  )
}
