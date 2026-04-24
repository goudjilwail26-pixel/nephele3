import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugify from 'slugify'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = 'DZD') {
  return `${price.toLocaleString('fr-DZ')} ${currency}`
}

export function generateSKU(index: number) {
  return `NPH-${String(index).padStart(4, '0')}`
}

export function generateSlug(text: string) {
  return slugify(text, { lower: true, strict: true })
}

export function getWhatsAppLink(phone: string, productSKU: string) {
  const message = encodeURIComponent(`Bonjour, je veux commander le produit ${productSKU}`)
  return `https://wa.me/${phone?.replace(/\+/g, '')}?text=${message}`
}

export function getInstagramDMLink(username: string) {
  const handle = username?.replace('https://instagram.com/', '').replace('@', '')
  return `https://ig.me/m/${handle}`
}
