import { Link } from 'react-router-dom'

export default function Footer() {
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/nephele.dz'
  
  return (
    <footer className="border-t border-nephele-border py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="greek text-2xl font-light tracking-widest mb-4">ΝΕΦΕΛΗ</h2>
          <p className="text-xs text-nephele-grey leading-relaxed">
            Curated vintage and thrift fashion. <br/>
            Constantine, Algeria.
          </p>
        </div>
        
        <div>
          <h3 className="text-[10px] tracking-[0.2em] uppercase text-nephele-grey mb-4">Shop</h3>
          <ul className="space-y-2">
            <li><Link to="/" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Home</Link></li>
            <li><Link to="/categories" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Categories</Link></li>
            <li><Link to="/cart" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] tracking-[0.2em] uppercase text-nephele-grey mb-4">Contact</h3>
          <ul className="space-y-2">
            <li>
              <a 
                href={`https://wa.me/${(import.meta.env.VITE_WHATSAPP_NUMBER || '213550000000').replace(/\+/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs hover:text-nephele-white text-nephele-grey transition-colors"
              >
                WhatsApp
              </a>
            </li>
            <li>
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs hover:text-nephele-white text-nephele-grey transition-colors"
              >
                Instagram
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-nephele-border text-xs text-nephele-grey flex justify-center">
        <p>&copy; {new Date().getFullYear()} ΝΕΦΕΛΗ. All rights reserved.</p>
      </div>
    </footer>
  )
}