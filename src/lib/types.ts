export type ProductStatus = 'available' | 'sold' | 'reserved' | 'draft'
export type ProductCondition = '10/10' | '9/10' | '8/10' | '7/10' | '6/10' | 'vintage'

export type OrderStatus = 
  | 'Nouvelle Commande' 
  | 'Confirmée' 
  | 'Préparation' 
  | 'Expédiée' 
  | 'Livrée' 
  | 'Annulée' 
  | 'Retour'

export const ORDER_STATUSES: OrderStatus[] = [
  'Nouvelle Commande',
  'Confirmée',
  'Préparation',
  'Expédiée',
  'Livrée',
  'Annulée',
  'Retour'
]

export const ALGERIA_WILAYAS = [
  'Adrar',
  'Aïn Defla',
  'Aïn Témouchent',
  'Alger',
  'Annaba',
  'Batna',
  'Béchar',
  'Béjaïa',
  'Biskra',
  'Blida',
  'Bordj Bou Arréridj',
  'Bouira',
  'Boumerdès',
  'Chlef',
  'Constantine',
  'Djelfa',
  'El Bayadh',
  'El Oued',
  'El Tarf',
  'Ghardaïa',
  'Guelma',
  'Illizi',
  'Jijel',
  'Khenchela',
  'Laghouat',
  'Liberté',
  'Médéa',
  'Mila',
  'Mostaganem',
  'Msila',
  'Naâma',
  'Oran',
  'Ouargla',
  'Oum El Bouaghi',
  'Relizane',
  'Saïda',
  'Sétif',
  'Sidi Bel Abbès',
  'Skikda',
  'Souk Ahras',
  'Tamanrasset',
  'Tébessa',
  'Tiaret',
  'Tindouf',
  'Tipaza',
  'Tissemsilt',
  'Tizi Ouzou',
  'Tlemcen',
  'Almontandria'
] as const

export type Wilaya = typeof ALGERIA_WILAYAS[number]

export interface Order {
  id: string
  order_number: string
  created_at: string
  customer_first_name: string
  customer_last_name: string
  phone: string
  address: string
  wilaya: string
  commune: string
  product_id?: string
  product_name: string
  product_sku?: string
  variant?: string
  quantity: number
  unit_price: number
  total_price: number
  payment_method: string
  status: OrderStatus
  notes?: string
  source: string
  ip_address?: string
  user_agent?: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  sku: string
  title: string
  slug: string
  description?: string
  price: number
  currency: string
  brand_id?: string
  category_id?: string
  brand?: Brand
  category?: Category
  size?: string
  condition: ProductCondition
  status: ProductStatus
  is_featured: boolean
  tags: string[]
  images: string[]
  cover_image?: string
  meta_title?: string
  meta_description?: string
  publish_at: string
  created_at: string
  updated_at: string
  views?: number
  favorites?: number
}

export interface ProductFilters {
  category?: string
  brand?: string
  size?: string
  condition?: string
  inStock?: string
  minPrice?: number
  maxPrice?: number
  status?: ProductStatus
  search?: string
  sort?: 'newest' | 'price_asc' | 'price_desc'
}

export interface StoreSettings {
  store_name: string
  whatsapp_number: string
  instagram_url: string
  shipping_text: string
  hero_headline: string
  hero_subline: string
}
