import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  if (!order) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="confirmation">
        <CheckCircle size={64} className="success-icon" />
        <h1>Order Confirmed!</h1>
        <p className="order-id">Order #{order.id}</p>

        <div className="bill">
          <h2>Bill Summary</h2>
          <table className="bill-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>₹{parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>₹{(item.quantity * parseFloat(item.unit_price)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}><strong>Total</strong></td>
                <td><strong>₹{parseFloat(order.total_amount).toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          <p className="delivery-address"><strong>Delivery to:</strong> {order.delivery_address}</p>
        </div>

        <div className="confirmation-actions">
          <Link to="/orders" className="btn btn-primary">View Orders</Link>
          <Link to="/" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
