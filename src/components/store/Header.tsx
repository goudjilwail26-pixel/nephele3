import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Search, Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-nephele-black/95 backdrop-blur-sm border-b border-nephele-border'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative flex items-center justify-between h-16 sm:h-20">
          <div className="flex-1"></div>

          {/* Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center hover:opacity-70 transition-opacity">
            <img src="/cloud-logo.png" alt="Nephele" className="h-8 sm:h-10 object-contain brightness-0 invert" />
          </Link>

          {/* Actions */}
          <div className="flex-1 flex items-center justify-end gap-4">
            <button className="text-nephele-grey hover:text-nephele-white transition-colors">
              <Search size={18} />
            </button>
            <button className="text-nephele-grey hover:text-nephele-white transition-colors">
              <Heart size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
