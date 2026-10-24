import React, { useState } from 'react';
import { CreditCard, Banknote, Wallet, Loader2, CheckCircle2 } from 'lucide-react';
import { money, unitPrice } from '@/lib/catalog';
import { cartTotals } from '@/components/store/CartDrawer';

const METHODS = [
  { key: 'card', label: 'Card', icon: CreditCard },
  { key: 'cash', label: 'Cash', icon: Banknote },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
];

export default function CheckoutDialog({ lines, onPay, onDone, onCancel }) {
  const [method, setMethod] = useState('card');
  const [step, setStep] = useState('pay');
  const [order, setOrder] = useState(null);
  const t = cartTotals(lines);

  const pay = async (e) => {
    e.preventDefault();
    setStep('processing');
    const [created] = await Promise.all([onPay(method, t), new Promise((r) => setTimeout(r, 1800))]);
    setOrder(created);
    setStep('receipt');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#14213D]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
        {step === 'pay' && (
          <form onSubmit={pay} className="space-y-4">
            <h2 className="font-['Bricolage_Grotesque'] font-bold text-2xl text-[#0B2A6F]">Lane 2 · Payment</h2>
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(({ key, label, icon: Icon }) => (
                <button type="button" key={key} onClick={() => setMethod(key)}
                  className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A6F] ${method === key ? 'border-[#0B2A6F] bg-[#0B2A6F]/5 text-[#0B2A6F]' : 'border-transparent bg-[#F6F4EE] text-[#14213D]'}`}>
                  <Icon className="w-4 h-4 mb-0.5" />{label}
                </button>
              ))}
            </div>
            {method === 'card' && (
              <div className="space-y-2 font-['JetBrains_Mono'] text-sm">
                <input required placeholder="Card number" defaultValue="4242 4242 4242 4242" className="w-full h-11 px-3 rounded-xl bg-[#F6F4EE] outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A6F]" />
                <div className="flex gap-2">
                  <input required placeholder="MM/YY" defaultValue="12/30" className="w-1/2 h-11 px-3 rounded-xl bg-[#F6F4EE] outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A6F]" />
                  <input required placeholder="CVC" defaultValue="123" className="w-1/2 h-11 px-3 rounded-xl bg-[#F6F4EE] outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A6F]" />
                </div>
              </div>
            )}
            {method === 'cash' && <p className="text-sm text-[#14213D]/70">Pay the cashier at lane 2. This is a simulated payment.</p>}
            {method === 'wallet' && <p className="text-sm text-[#14213D]/70">Tap your phone on the terminal. This is a simulated payment.</p>}
            <p className="text-xs text-[#14213D]/50">Demo checkout: no real payment is taken.</p>
            <div className="flex gap-2">
              <button type="button" onClick={onCancel} className="h-12 px-4 rounded-xl bg-[#F6F4EE] text-sm font-medium">Back</button>
              <button type="submit" className="flex-1 h-12 rounded-xl bg-[#0B2A6F] text-white font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2A6F] outline-none">Pay {money(t.total)}</button>
            </div>
          </form>
        )}
        {step === 'processing' && (
          <div className="py-10 flex flex-col items-center gap-3 text-[#0B2A6F]">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-medium">Processing payment…</p>
          </div>
        )}
        {step === 'receipt' && order && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#0B2A6F]">
              <CheckCircle2 className="w-7 h-7" />
              <h2 className="font-['Bricolage_Grotesque'] font-bold text-2xl">Thank you!</h2>
            </div>
            <p className="font-['JetBrains_Mono'] text-xs text-[#14213D]/60">Order {order.order_number} · paid by {order.payment_method}</p>
            <div className="max-h-44 overflow-y-auto space-y-1 text-sm font-['JetBrains_Mono'] text-[#14213D]">
              {lines.map(({ product, qty }) => (
                <div key={product.sku} className="flex justify-between gap-3"><span className="truncate">{qty} × {product.name}</span><span>{money(unitPrice(product) * qty)}</span></div>
              ))}
            </div>
            <div className="border-t pt-2 text-sm font-['JetBrains_Mono'] space-y-1">
              <div className="flex justify-between"><span>Tax</span><span>{money(order.tax)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{money(order.total)}</span></div>
            </div>
            <button onClick={onDone} className="w-full h-12 rounded-xl bg-[#0B2A6F] text-white font-semibold focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2A6F] outline-none">Continue shopping</button>
          </div>
        )}
      </div>
    </div>
  );
}