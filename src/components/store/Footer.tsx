import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-nephele-border py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
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
            <li><Link to="/shop" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">All Pieces</Link></li>
            <li><Link to="/categories" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Categories</Link></li>
            <li><Link to="/brands" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Brands</Link></li>
            <li><Link to="/shop?sort=newest" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] tracking-[0.2em] uppercase text-nephele-grey mb-4">Support</h3>
          <ul className="space-y-2">
            <li><Link to="/faq" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">FAQ</Link></li>
            <li><Link to="/shipping" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/contact" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[10px] tracking-[0.2em] uppercase text-nephele-grey mb-4">Socials</h3>
          <ul className="space-y-2">
            <li><a href={import.meta.env.VITE_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">Instagram</a></li>
            <li><a href="#" className="text-xs hover:text-nephele-white text-nephele-grey transition-colors">TikTok</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-nephele-border text-xs text-nephele-grey flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} ΝΕΦΕΛΗ. All rights reserved.</p>
        <div className="flex gap-4">
          <Link to="/privacy" className="hover:text-nephele-white transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-nephele-white transition-colors">Terms</Link>
          <Link to="/admin" className="hover:text-nephele-white transition-colors border-l border-nephele-border pl-4">Admin Hub</Link>
        </div>
      </div>
    </footer>
  )
}
