/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/store/Header';
import Footer from './components/store/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductPage from './pages/ProductPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProductForm from './pages/admin/AdminProductForm';
import { isSupabaseConfigured } from './lib/supabase/client';

function StoreLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {!isSupabaseConfigured && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-500 text-xs text-center py-2 px-4 z-[100] relative">
          Supabase is not configured. Add your API keys to the environment and restart the server to see real data.
        </div>
      )}
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products/:id" element={<AdminProductForm />} />
        </Route>
        
        <Route element={<StoreLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:slug" element={<ProductPage />} />
        </Route>
        
        <Route path="*" element={<HomePage />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A18',
            color: '#F8F8F6',
            border: '1px solid #2A2A28',
            borderRadius: '2px',
            fontSize: '13px',
          },
        }}
      />
    </BrowserRouter>
  );
}
