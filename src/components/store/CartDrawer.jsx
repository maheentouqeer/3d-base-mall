import React from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { money, unitPrice, TAX_RATE } from '@/lib/catalog';

export function cartTotals(lines) {
  const subtotal = +lines.reduce((s, l) => s + unitPrice(l.product) * l.qty, 0).toFixed(2);
  const tax = +(subtotal * TAX_RATE).toFixed(2);
  return { subtotal, tax, total: +(subtotal + tax).toFixed(2) };
}

export default function CartDrawer({ lines, onClose, onQty, onCheckout }) {
  const t = cartTotals(lines);
  return (
    <aside className="absolute z-40 top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 ease-out">
      <div className="flex items-center justify-between px-5 h-16 border-b border-[#0B2A6F]/10">
        <h2 className="font-['Bricolage_Grotesque'] font-bold text-xl text-[#0B2A6F]">Your cart</h2>
        <button onClick={onClose} aria-label="Close cart" className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#F6F4EE] focus-visible:ring-2 focus-visible:ring-[#0B2A6F] outline-none"><X className="w-5 h-5" /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {lines.length === 0 && <p className="text-sm text-[#14213D]/60">Your cart is empty. Walk the aisles and click a product to add it.</p>}
        {lines.map(({ product, qty }) => (
          <div key={product.sku} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#14213D] truncate">{product.name}</p>
              <p className="text-xs font-['JetBrains_Mono'] text-[#14213D]/60">{money(unitPrice(product))}</p>
            </div>
            <div className="flex items-center rounded-xl bg-[#F6F4EE]">
              <button onClick={() => onQty(product.sku, qty - 1)} aria-label="Less" className="w-9 h-11 flex items-center justify-center"><Minus className="w-3.5 h-3.5" /></button>
              <span className="w-6 text-center text-sm font-['JetBrains_Mono']">{qty}</span>
              <button onClick={() => onQty(product.sku, Math.min(qty + 1, Math.max(1, product.qty)))} aria-label="More" className="w-9 h-11 flex items-center justify-center"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={() => onQty(product.sku, 0)} aria-label="Remove" className="w-10 h-11 flex items-center justify-center text-[#14213D]/50 hover:text-[#14213D]"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
      <div className="p-5 border-t border-[#0B2A6F]/10 space-y-1.5 text-sm font-['JetBrains_Mono'] text-[#14213D]">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(t.subtotal)}</span></div>
        <div className="flex justify-between"><span>Tax (8%)</span><span>{money(t.tax)}</span></div>
        <div className="flex justify-between font-bold text-base pt-1"><span>Total</span><span>{money(t.total)}</span></div>
        <button
          disabled={lines.length === 0}
          onClick={onCheckout}
          className="mt-3 w-full h-12 rounded-xl bg-[#0B2A6F] text-white font-sans font-semibold disabled:opacity-40 hover:bg-[#0B2A6F]/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2A6F] outline-none"
        >
          Go to checkout lane
        </button>
      </div>
    </aside>
  );
}