import { useState } from 'react';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import EyebrowLabel from '../components/ui/EyebrowLabel';

export default function Admin() {
  const [tab, setTab] = useState('products');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <EyebrowLabel>Internal</EyebrowLabel>
      <h1 className="font-serif text-4xl text-ink mt-2 mb-8">Control</h1>

      <div className="flex gap-6 border-b border-hairline mb-10">
        <TabButton active={tab === 'products'} onClick={() => setTab('products')}>Products</TabButton>
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')}>Orders</TabButton>
      </div>

      {tab === 'products' ? <AdminProducts /> : <AdminOrders />}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 -mb-px text-[15px] font-medium transition-colors border-b-2 ${
        active ? 'text-moss-deep border-moss' : 'text-ink-muted border-transparent hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
