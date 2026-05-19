import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <ShoppingBag size={48} className="mx-auto text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Your cart is empty</h2>
        <p className="mt-1 text-muted-foreground">Add some items to get started</p>
        <Button asChild className="mt-4 bg-[#e23744] hover:bg-[#c52d39]">
          <Link to="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-1 text-2xl font-bold">Shopping Cart</h1>
      <p className="mb-6 flex items-center gap-1.5 text-sm text-green-600">
        <Clock size={14} /> Delivery in 10 minutes
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_350px]">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="flex items-center gap-4 p-4">
                <img src={item.image_url || '/placeholder.png'} alt={item.name} className="h-16 w-16 rounded-lg object-cover bg-muted" />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {item.variant_name && <span className="font-medium text-foreground">{item.variant_name} · </span>}
                    ₹{item.price} / {item.unit}
                  </p>
                </div>
                <div className="flex items-center overflow-hidden rounded-lg border border-[#e23744]">
                  <Button variant="ghost" size="icon" aria-label="Decrease quantity" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={14} />
                  </Button>
                  <span className="flex h-8 w-8 items-center justify-center border-x border-[#e23744] text-sm font-bold">{item.quantity}</span>
                  <Button variant="ghost" size="icon" aria-label="Increase quantity" className="h-8 w-8 rounded-none" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={14} />
                  </Button>
                </div>
                <p className="min-w-[70px] text-right font-bold">₹{(item.price * item.quantity).toFixed(2)}</p>
                <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="h-fit sticky top-20 border-2 border-[#e23744]/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-semibold text-green-600">FREE</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-extrabold">
              <span>Total</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <Button className="w-full bg-[#e23744] text-base font-bold hover:bg-[#c52d39]" size="lg" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              <Clock size={10} className="mr-0.5 inline" /> Estimated delivery in 10 minutes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}