import { useState, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { Upload, FileText, Check, X, AlertCircle, Download, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

interface ParsedProduct {
  title: string
  sku: string
  price: number
  size?: string
  brand?: string
  category?: string
  condition?: string
  description?: string
  status: string
  error?: string
}

export default function AdminImport() {
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedProduct[]>([])
  const [uploading, setUploading] = useState(false)
  const [imported, setImported] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = async () => {
    if (!file) return

    const text = await file.text()
    const lines = text.split('\n').filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    const products: ParsedProduct[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const product: ParsedProduct = {
        title: values[headers.indexOf('title')] || '',
        sku: values[headers.indexOf('sku')] || '',
        price: parseInt(values[headers.indexOf('price')]) || 0,
        size: values[headers.indexOf('size')] || '',
        brand: values[headers.indexOf('brand')] || '',
        category: values[headers.indexOf('category')] || '',
        condition: values[headers.indexOf('condition')] || '9/10',
        description: values[headers.indexOf('description')] || '',
        status: 'available'
      }

      if (!product.title || !product.sku || !product.price) {
        product.error = 'Missing required fields'
        product.status = 'draft'
      }
      products.push(product)
    }

    setParsed(products)
  }

  const importProducts = async () => {
    if (!isSupabaseConfigured || parsed.length === 0) return

    setUploading(true)
    let success = 0

    for (const product of parsed) {
      if (product.error) continue

      const slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-')

      const { error } = await supabase.from('products').insert({
        title: product.title,
        sku: product.sku,
        price: product.price,
        slug,
        size: product.size,
        condition: product.condition,
        status: product.status,
        description: product.description,
        is_featured: false,
        tags: [],
        images: [],
        currency: 'DZD'
      })

      if (!error) success++
    }

    setImported(success)
    setUploading(false)
    toast.success(`${success} produits importés`)

    if (success > 0) {
      setTimeout(() => {
        window.location.href = '/admin'
      }, 2000)
    }
  }

  const downloadTemplate = () => {
    const template = 'title,sku,price,size,brand,category,condition,description\nVintage Jacket,NPH-001,15000,M,Louis Vuitton,Tools,9/10,vintage jacket excellent etat'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template.csv'
    a.click()
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-nephele-grey mb-1">Gestion des données</p>
        <h1 className="greek text-3xl font-light">ImporterProduits</h1>
      </div>

      {!isSupabaseConfigured && (
        <div className="flex items-center gap-2 p-4 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
          <AlertCircle size={16} />
          <span>Supabase non configuré - ajoutez les clés dans .env.local</span>
        </div>
      )}

      {!parsed.length ? (
        <div className="border-2 border-dashed border-nephele-border p-12 text-center">
          <Upload size={32} className="mx-auto mb-4 text-nephele-grey" />
          <p className="text-sm mb-4">Sélectionnez un fichier CSV</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) {
                setFile(f)
                setTimeout(() => {
                  const reader = new FileReader()
                  reader.onload = () => {
                    const lines = reader.result?.toString().split('\n').filter(l => l.trim())
                    if (lines && lines.length > 1) {
                      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
                      const products: ParsedProduct[] = []
                      for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim())
                        const p: ParsedProduct = {
                          title: values[headers.indexOf('title')] || '',
                          sku: values[headers.indexOf('sku')] || '',
                          price: parseInt(values[headers.indexOf('price')]) || 0,
                          size: values[headers.indexOf('size')] || '',
                          brand: values[headers.indexOf('brand')] || '',
                          condition: values[headers.indexOf('condition')] || '9/10',
                          description: values[headers.indexOf('description')] || '',
                          status: 'available'
                        }
                        if (!p.title || !p.sku || !p.price) {
                          p.error = 'Champs requis manquants'
                          p.status = 'draft'
                        }
                        products.push(p)
                      }
                      setParsed(products)
                    }
                  }
                  reader.readAsText(f)
                }, 100)
              }
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-nephele-white text-nephele-black px-6 py-2 text-xs uppercase hover:bg-nephele-silver"
          >
            Choisir fichier
          </button>
          <button
            onClick={downloadTemplate}
            className="ml-4 text-xs text-nephele-grey hover:text-nephele-white flex items-center gap-2 inline-flex"
          >
            <Download size={14} /> Modèle CSV
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm">{parsed.length} produits détectés</p>
            <button
              onClick={() => {
                setParsed([])
                setFile(null)
                setImported(0)
              }}
              className="text-xs text-nephele-grey hover:text-red-400"
            >
              Réinitialiser
            </button>
          </div>

          <div className="border border-nephele-border max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-nephele-dim sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2 text-xs">SKU</th>
                  <th className="text-left px-4 py-2 text-xs">Titre</th>
                  <th className="text-left px-4 py-2 text-xs">Prix</th>
                  <th className="text-left px-4 py-2 text-xs">Taille</th>
                  <th className="text-left px-4 py-2 text-xs">Statut</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((p, i) => (
                  <tr key={i} className="border-t border-nephele-border">
                    <td className="px-4 py-2 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-2">{p.title}</td>
                    <td className="px-4 py-2">{p.price} DA</td>
                    <td className="px-4 py-2">{p.size}</td>
                    <td className="px-4 py-2">
                      {p.error ? (
                        <span className="text-red-400 text-xs">{p.error}</span>
                      ) : (
                        <span className="text-green-400 text-xs">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-4">
            <button
              onClick={importProducts}
              disabled={uploading || !isSupabaseConfigured}
              className="bg-nephele-white text-nephele-black px-6 py-3 text-xs uppercase disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>Import en cours...</>
              ) : (
                <><Check size={14} /> Importer {parsed.filter(p => !p.error).length} produits</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}