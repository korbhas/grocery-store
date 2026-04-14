import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import EyebrowLabel from '../components/ui/EyebrowLabel';
import OrnamentalDivider from '../components/ui/OrnamentalDivider';
import Button from '../components/ui/Button';
import { Sun } from '../assets/illustrations';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  if (!order) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center text-ink-muted">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <Sun size={96} className="text-moss mx-auto mb-6" />
      <EyebrowLabel>Order #{order.id}</EyebrowLabel>
      <h1 className="font-serif text-4xl sm:text-5xl text-ink mt-2">Thank you.</h1>
      <p className="text-ink-muted mt-3">We'll have this on its way shortly.</p>

      <OrnamentalDivider />

      <div className="text-left">
        <EyebrowLabel>Your order</EyebrowLabel>
        <table className="w-full mt-4 text-[15px]">
          <thead>
            <tr className="border-b border-hairline">
              <th className="py-3 pr-2 text-left eyebrow">Item</th>
              <th className="py-3 px-2 text-right eyebrow">Qty</th>
              <th className="py-3 px-2 text-right eyebrow">Price</th>
              <th className="py-3 pl-2 text-right eyebrow">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-hairline">
                <td className="py-3 pr-2 font-serif">{item.name}</td>
                <td className="py-3 px-2 text-right text-ink-muted">{item.quantity}</td>
                <td className="py-3 px-2 text-right text-ink-muted">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                <td className="py-3 pl-2 text-right font-medium">₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-4 pr-2 font-serif text-lg">Total</td>
              <td className="py-4 pl-2 text-right font-serif text-lg">₹{parseFloat(order.total_amount).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-6 bg-surface border border-hairline rounded-md p-5">
          <EyebrowLabel>Delivering to</EyebrowLabel>
          <p className="mt-2 text-ink-muted leading-relaxed">{order.delivery_address}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <Link to="/orders"><Button variant="secondary" fullWidth>View all orders</Button></Link>
        <Link to="/"><Button variant="ghost" fullWidth>Continue shopping</Button></Link>
      </div>
    </div>
  );
}
