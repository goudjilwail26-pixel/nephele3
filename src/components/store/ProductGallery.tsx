import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductGalleryProps {
  images: string[]
  title: string
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-nephele-dim flex items-center justify-center border border-nephele-border">
         <span className="greek text-6xl text-nephele-border">ν</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row-reverse gap-4">
      {/* Main Image */}
      <div className="flex-1 aspect-[3/4] bg-nephele-dim relative border border-nephele-border">
        <img 
          src={images[activeIdx]} 
          alt={`${title} - view ${activeIdx + 1}`} 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 lg:w-24 flex-shrink-0 hide-scrollbar pb-2 md:pb-0">
        {images.map((img, idx) => (
          <button 
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={cn(
              "relative aspect-[3/4] w-20 md:w-full flex-shrink-0 border transition-all",
              activeIdx === idx ? "border-nephele-white opacity-100" : "border-nephele-border opacity-50 hover:opacity-100"
            )}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="absolute inset-0 w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
