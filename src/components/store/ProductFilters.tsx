import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'
import type { Category, Brand } from '@/lib/types'

interface ProductFiltersProps {
  categories: Category[]
  brands: Brand[]
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Unique']
const CONDITIONS = ['10/10', '9/10', '8/10', '7/10', 'Vintage']

export default function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    size: searchParams.get('size') || '',
    condition: searchParams.get('condition') || '',
    inStock: searchParams.get('inStock') === 'true'
  })

  const updateFilter = (key: string, value: string | boolean) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    const params = new URLSearchParams(searchParams)
    if (newFilters.category) params.set('category', newFilters.category)
    else params.delete('category')
    if (newFilters.brand) params.set('brand', newFilters.brand)
    else params.delete('brand')
    if (newFilters.size) params.set('size', newFilters.size)
    else params.delete('size')
    if (newFilters.condition) params.set('condition', newFilters.condition)
    else params.delete('condition')
    if (newFilters.inStock) params.set('inStock', 'true')
    else params.delete('inStock')
    
    navigate(`/?${params.toString()}`)
  }

  useEffect(() => {
    setFilters({
      category: searchParams.get('category') || '',
      brand: searchParams.get('brand') || '',
      size: searchParams.get('size') || '',
      condition: searchParams.get('condition') || '',
      inStock: searchParams.get('inStock') === 'true'
    })
  }, [searchParams])

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={filters.category}
        onChange={e => updateFilter('category', e.target.value)}
        className="bg-nephele-dim border border-nephele-border px-3 py-2 text-xs tracking-wider uppercase"
      >
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.slug}>{cat.name}</option>
        ))}
      </select>

      <select
        value={filters.brand}
        onChange={e => updateFilter('brand', e.target.value)}
        className="bg-nephele-dim border border-nephele-border px-3 py-2 text-xs tracking-wider uppercase"
      >
        <option value="">All Brands</option>
        {brands.map(brand => (
          <option key={brand.id} value={brand.slug}>{brand.name}</option>
        ))}
      </select>

      <select
        value={filters.size}
        onChange={e => updateFilter('size', e.target.value)}
        className="bg-nephele-dim border border-nephele-border px-3 py-2 text-xs tracking-wider uppercase"
      >
        <option value="">All Sizes</option>
        {SIZES.map(size => (
          <option key={size} value={size}>{size}</option>
        ))}
      </select>

      <select
        value={filters.condition}
        onChange={e => updateFilter('condition', e.target.value)}
        className="bg-nephele-dim border border-nephele-border px-3 py-2 text-xs tracking-wider uppercase"
      >
        <option value="">Any Condition</option>
        {CONDITIONS.map(cond => (
          <option key={cond} value={cond}>{cond}</option>
        ))}
      </select>

      <label className="flex items-center gap-2 px-3 py-2 border border-nephele-border cursor-pointer hover:bg-nephele-dim">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={e => updateFilter('inStock', e.target.checked)}
          className="w-3 h-3"
        />
        <span className="text-xs tracking-wider uppercase">In Stock</span>
      </label>
    </div>
  )
}