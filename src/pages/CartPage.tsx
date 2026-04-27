import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'
import toast from 'react-hot-toast'

export default function CartPage() {
  const [cart, setCart] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(c)
    setLoading(false)
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    const updated = cart.map((item: Product) => {
      if (item.id === id) {
        const newQty = (item as any).quantity + delta
        if (newQty < 1) return null
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const removeItem = (id: string) => {
    const updated = cart.filter((item: Product) => item.id !== id)
    setCart(updated)
    localStorage.setItem('cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const total = cart.reduce((sum: number, item: Product) => {
    return sum + (item.price * ((item as any).quantity || 1))
  }, 0)

  const proceedToCheckout = () => {
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-2xl mx-auto animate-pulse">
          <div className="h-8 bg-nephele-dim w-1/3 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-nephele-dim" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 px-4 sm:px-6 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-nephele-grey mb-6 hover:text-nephele-white">
          <ArrowLeft size={14} /> Continue Shopping
        </Link>

        <h1 className="text-2xl font-light tracking-wider mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-nephele-border">
            <ShoppingBag size={40} className="mx-auto mb-4 text-nephele-grey" />
            <p className="mb-4">Your cart is empty</p>
            <Link to="/" className="text-sm underline">Browse products</Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-8">
              {cart.map((item: Product) => (
                <div key={item.id} className="flex gap-4 p-4 bg-nephele-dim border border-nephele-border">
                  <Link to={`/products/${item.slug}`} className="w-20 sm:w-24 flex-shrink-0">
                    <img 
                      src={item.cover_image || item.images?.[0]} 
                      alt={item.title}
                      className="w-full aspect-[3/4] object-cover"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] tracking-widest uppercase text-nephele-grey">
                          {item.brand?.name || 'VINTAGE'}
                        </p>
                        <Link to={`/products/${item.slug}`} className="text-sm mt-0.5 hover:text-nephele-grey">
                          {item.title}
                        </Link>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-nephele-grey hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 border border-nephele-border flex items-center justify-center hover:bg-nephele-black"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-sm">{(item as any).quantity || 1}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 border border-nephele-border flex items-center justify-center hover:bg-nephele-black"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      
                      <p className="font-mono">{formatPrice(item.price * ((item as any).quantity || 1))}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-nephele-border pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs tracking-widest uppercase text-nephele-grey">Subtotal</span>
                <span className="text-xl font-mono">{formatPrice(total)}</span>
              </div>
              
              <p className="text-xs text-nephele-grey mb-4">
                Shipping & payment calculated at checkout
              </p>

              <button
                onClick={proceedToCheckout}
                className="w-full bg-nephele-white text-nephele-black py-4 text-xs tracking-[0.2em] uppercase font-bold hover:bg-nephele-silver"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}