-- Orders table for Algeria COD ecommerce
-- Run this SQL in your Supabase SQL editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  customer_first_name TEXT NOT NULL,
  customer_last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  commune TEXT NOT NULL,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_sku TEXT,
  variant TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'COD',
  status TEXT NOT NULL DEFAULT 'Nouvelle Commande',
  notes TEXT,
  source TEXT DEFAULT 'website',
  ip_address TEXT,
  user_agent TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy for admin full access
CREATE POLICY "Admin full access to orders" ON orders
  FOR ALL USING (true);

-- Create indexes for common queries
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_wilaya ON orders(wilaya);
CREATE INDEX idx_orders_phone ON orders(phone);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Insert some test orders (optional)
-- INSERT INTO orders (order_number, customer_first_name, customer_last_name, phone, address, wilaya, commune, product_name, product_sku, quantity, unit_price, total_price, status)
-- VALUES ('CMD-0001', 'Ahmed', 'Bensalah', '+213550000000', '12 Rue Didouche Mourad', 'Alger', 'Alger Centre', 'Vintage Jacket', 'NPH-0001', 1, 15000, 15000, 'Nouvelle Commande');