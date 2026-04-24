import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image / Placeholder */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-nephele-black/30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1542272604-78021cb8b776?q=80&w=2560&auto=format&fit=crop"
          alt="Vintage Fashion"
          className="w-full h-full object-cover grayscale opacity-40"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 sm:px-6 w-full max-w-4xl mx-auto flex flex-col items-center animate-fade-up">
        <p className="text-xs tracking-[0.4em] uppercase text-nephele-silver mb-6">
          Curated Vintage · Constantine
        </p>
        <h1 className="greek text-5xl sm:text-7xl md:text-8xl font-light mb-8 leading-tight">
          الموضة القديمة.<br/>روح جديدة.
        </h1>
        <p className="text-sm md:text-base text-nephele-grey mb-10 max-w-lg mx-auto">
          Every piece has a story. We hand-pick vintage garments that deserve a second life. 
          Limited drops. Unique pieces.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            to="/shop"
            className="group flex items-center gap-3 bg-nephele-white text-nephele-black px-8 py-4 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors"
          >
            Explore the Drop
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/about"
            className="text-xs tracking-[0.2em] uppercase text-nephele-white border-b border-transparent hover:border-nephele-white transition-colors py-2 px-4"
          >
            Our Story
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20 animate-bounce">
         <span className="w-[1px] h-12 bg-gradient-to-b from-nephele-silver to-transparent block"></span>
      </div>
    </section>
  )
}
