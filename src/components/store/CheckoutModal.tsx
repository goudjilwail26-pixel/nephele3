import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { ALGERIA_WILAYAS, ORDER_STATUSES } from '@/lib/types'
import type { Product, OrderStatus } from '@/lib/types'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  product: Product
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  address: string
  wilaya: string
  commune: string
  quantity: number
  notes: string
}

export default function CheckoutModal({ product, isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    wilaya: '',
    commune: '',
    quantity: 1,
    notes: ''
  })

  useEffect(() => {
    if (!isOpen) {
      setSuccess(false)
      setErrors({})
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        wilaya: '',
        commune: '',
        quantity: 1,
        notes: ''
      })
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }
    if (!formData.phone.replace(/\s/g, '').replace(/^\+213/, '').replace(/^0/, '')) {
      newErrors.phone = 'Le numéro de téléphone est requis'
    }
    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise"
    }
    if (!formData.wilaya) {
      newErrors.wilaya = 'La wilaya est requise'
    }
    if (!formData.commune.trim()) {
      newErrors.commune = 'La commune est requise'
    }
    if (formData.quantity < 1) {
      newErrors.quantity = 'La quantité doit être au minimum 1'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateOrderNumber = (): string => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `CMD-${dateStr}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    try {
      const orderNum = generateOrderNumber()
      const totalPrice = product.price * formData.quantity
      
      const { error } = await supabase.from('orders').insert({
        order_number: orderNum,
        customer_first_name: formData.firstName.trim(),
        customer_last_name: formData.lastName.trim(),
        phone: formData.phone.replace(/\s/g, ''),
        address: formData.address.trim(),
        wilaya: formData.wilaya,
        commune: formData.commune.trim(),
        product_id: product.id,
        product_name: product.title,
        product_sku: product.sku,
        variant: product.size || null,
        quantity: formData.quantity,
        unit_price: product.price,
        total_price: totalPrice,
        payment_method: 'COD',
        status: ORDER_STATUSES[0] as OrderStatus,
        notes: formData.notes.trim() || null,
        source: 'website',
        ip_address: null,
        user_agent: navigator.userAgent
      })
      
      if (error) throw error
      
      setOrderNumber(orderNum)
      setSuccess(true)
      toast.success('Commande envoyée avec succès!')
    } catch (err: any) {
      console.error('Order error:', err)
      toast.error('Erreur lors de la commande. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const inputClass = (field: keyof FormData) =>
    `w-full bg-nephele-dim border ${errors[field] ? 'border-red-500' : 'border-nephele-border'} px-4 py-3 text-sm focus:outline-none focus:border-nephele-grey transition-colors placeholder:text-nephele-grey/50`

  if (success) {
    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md bg-nephele-black border border-nephele-border p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
                  <Dialog.Title className="greek text-2xl font-light mb-2">
                    Commande confirmée!
                  </Dialog.Title>
                  <p className="text-nephele-grey text-sm mb-2">
                    Votre commande a été envoyée avec succès.
                  </p>
                  <p className="text-nephele-grey text-sm mb-6">
                    Nous vous contacterons bientôt pour la livraison.
                  </p>
                  <div className="bg-nephele-dim border border-nephele-border p-4 mb-6">
                    <p className="text-xs tracking-[0.2em] uppercase text-nephele-grey mb-1">Numéro de commande</p>
                    <p className="text-lg font-mono">{orderNumber}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-full bg-nephele-white text-nephele-black py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors font-medium"
                  >
                    Fermer
                  </button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    )
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="w-full max-w-lg bg-nephele-black border border-nephele-border">
                <div className="flex items-center justify-between px-6 py-4 border-b border-nephele-border">
                  <Dialog.Title className="greek text-xl font-light">
                    Commander
                  </Dialog.Title>
                  <button onClick={onClose} className="p-2 hover:bg-nephele-dim transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6">
                  <div className="bg-nephele-dim border border-nephele-border p-4 mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-light">{product.title}</p>
                        <p className="text-xs text-nephele-grey mt-1">{product.sku}</p>
                      </div>
                      <p className="font-mono">{formatPrice(product.price)}</p>
                    </div>
                    {product.size && (
                      <p className="text-xs text-nephele-grey">Taille: {product.size}</p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Prénom *</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={e => updateField('firstName', e.target.value)}
                          placeholder="Votre prénom"
                          className={inputClass('firstName')}
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Nom *</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={e => updateField('lastName', e.target.value)}
                          placeholder="Votre nom"
                          className={inputClass('lastName')}
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Numéro de téléphone *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        placeholder="+213 6XX XXX XXX"
                        className={inputClass('phone')}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Wilaya *</label>
                      <select
                        value={formData.wilaya}
                        onChange={e => updateField('wilaya', e.target.value)}
                        className={inputClass('wilaya')}
                      >
                        <option value="">Sélectionner une wilaya</option>
                        {ALGERIA_WILAYAS.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                      {errors.wilaya && <p className="text-red-500 text-xs mt-1">{errors.wilaya}</p>}
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Commune / Ville *</label>
                      <input
                        type="text"
                        value={formData.commune}
                        onChange={e => updateField('commune', e.target.value)}
                        placeholder="Ex: Alger Centre, Oran, etc."
                        className={inputClass('commune')}
                      />
                      {errors.commune && <p className="text-red-500 text-xs mt-1">{errors.commune}</p>}
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Adresse complète *</label>
                      <textarea
                        value={formData.address}
                        onChange={e => updateField('address', e.target.value)}
                        placeholder="Rue, numéro de rue, bâtiment, etc."
                        rows={2}
                        className={inputClass('address')}
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Quantité *</label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateField('quantity', Math.max(1, formData.quantity - 1))}
                          className="w-10 h-10 border border-nephele-border flex items-center justify-center hover:bg-nephele-dim transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-mono">{formData.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateField('quantity', formData.quantity + 1)}
                          className="w-10 h-10 border border-nephele-border flex items-center justify-center hover:bg-nephele-dim transition-colors"
                        >
                          +
                        </button>
                        <span className="ml-auto font-mono text-lg">
                          Total: {formatPrice(product.price * formData.quantity)}
                        </span>
                      </div>
                      {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
                    </div>

                    <div>
                      <label className="block text-xs tracking-[0.1em] uppercase text-nephele-grey mb-2">Notes (optionnel)</label>
                      <textarea
                        value={formData.notes}
                        onChange={e => updateField('notes', e.target.value)}
                        placeholder="Instructions spéciales, préférences, etc."
                        rows={2}
                        className="w-full bg-nephele-dim border border-nephele-border px-4 py-3 text-sm focus:outline-none focus:border-nephele-grey transition-colors placeholder:text-nephele-grey/50"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-nephele-white text-nephele-black py-3.5 text-xs tracking-[0.2em] uppercase hover:bg-nephele-silver transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />
                          Traitement...
                        </>
                      ) : (
                        `Commander - ${formatPrice(product.price * formData.quantity)}`
                      )}
                    </button>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}