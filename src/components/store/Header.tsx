import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { Search, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/lib/types'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCartCount(cart.length)
    }
    updateCart()
    window.addEventListener('cart-updated', updateCart)
    return () => window.removeEventListener('cart-updated', updateCart)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search)}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-nephele-black/95 backdrop-blur-sm border-b border-nephele-border'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6">
          <div className="relative flex items-center justify-between h-14 sm:h-16">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-nephele-white p-2 -ml-2"
            >
              <Menu size={22} />
            </button>

            <nav className="hidden lg:flex items-center gap-6">
              <Link to="/" className="text-xs tracking-[0.2em] uppercase text-nephele-white hover:text-nephele-grey transition-colors">
                Home
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="text-xs tracking-[0.2em] uppercase text-nephele-white hover:text-nephele-grey transition-colors flex items-center gap-1"
                >
                  Shop <ChevronDown size={12} />
                </button>
              </div>
              <Link to="/categories" className="text-xs tracking-[0.2em] uppercase text-nephele-white hover:text-nephele-grey transition-colors">
                Categories
              </Link>
            </nav>

            <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center hover:opacity-70 transition-opacity">
              <span className="text-2xl sm:text-3xl">☁️</span>
            </Link>

            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-nephele-white hover:text-nephele-grey transition-colors"
              >
                <Search size={18} />
              </button>

              <Link 
                to="/cart"
                className="relative text-nephele-white hover:text-nephele-grey transition-colors"
              >
                <ShoppingBag size={18} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-nephele-white text-nephele-black text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80" onClick={() => setSearchOpen(false)}>
          <div className="max-w-xl mx-auto mt-24 px-4" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSearch} className="flex items-center gap-3 bg-nephele-black border border-nephele-border p-4">
              <Search size={18} className="text-nephele-grey" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-nephele-white focus:outline-none text-sm"
              />
              <button type="button" onClick={() => setSearchOpen(false)}>
                <X size={18} className="text-nephele-grey" />
              </button>
            </form>
          </div>
        </div>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-black/90 lg:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-nephele-border">
              <span className="text-xl">☁️</span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 p-6 space-y-6">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl tracking-wider"
              >
                Home
              </Link>
              <Link 
                to="/categories" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl tracking-wider"
              >
                Categories
              </Link>
              <Link 
                to="/cart" 
                onClick={() => setMobileMenuOpen(false)}
                className="block text-xl tracking-wider"
              >
                Cart ({cartCount})
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}