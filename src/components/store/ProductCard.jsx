import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { money, unitPrice } from '@/lib/catalog';

export default function ProductCard({ product, onClose, onAdd }) {
  const [qty, setQty] = useState(1);
  const out = product.qty <= 0;
  const low = !out && product.qty <= 5;
  const max = Math.max(1, product.qty);

  return (
    <div className="absolute z-30 bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm bg-white rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-3 duration-150 ease-out">
      <button onClick={onClose} aria-label="Close" className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-xl text-[#14213D]/60 hover:bg-[#F6F4EE] focus-visible:ring-2 focus-visible:ring-[#0B2A6F] outline-none">
        <X className="w-4 h-4" />
      </button>
      <div className="flex gap-4">
        <div className="w-20 h-20 shrink-0 rounded-xl bg-[#0B2A6F] text-white flex items-center justify-center font-['Bricolage_Grotesque'] font-bold text-2xl">
          {product.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 pr-8">
          <p className="text-xs uppercase tracking-wider text-[#14213D]/50 font-['JetBrains_Mono']">{product.category} · {product.sku}</p>
          <h3 className="font-['Bricolage_Grotesque'] font-bold text-lg leading-tight text-[#14213D]">{product.name}</h3>
          <div className="mt-1 flex items-baseline gap-2 font-['JetBrains_Mono']">
            <span className="text-lg font-semibold text-[#0B2A6F]">{money(unitPrice(product))}</span>
            {product.sale_pct > 0 && (
              <>
                <span className="text-xs line-through text-[#14213D]/40">{money(product.price)}</span>
                <span className="text-xs font-bold text-white bg-[#E5322D] rounded px-1.5 py-0.5">-{product.sale_pct}%</span>
              </>
            )}
          </div>
          {low && <p className="mt-1 text-xs font-semibold text-[#E5322D]">Only {product.qty} left</p>}
          {out && <p className="mt-1 text-xs font-semibold text-[#E5322D]">Out of stock</p>}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex items-center rounded-xl bg-[#F6F4EE]">
          <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less" className="w-11 h-11 flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-[#0B2A6F] outline-none"><Minus className="w-4 h-4" /></button>
          <span className="w-8 text-center font-['JetBrains_Mono'] text-sm">{qty}</span>
          <button onClick={() => setQty(Math.min(max, qty + 1))} aria-label="More" className="w-11 h-11 flex items-center justify-center rounded-xl focus-visible:ring-2 focus-visible:ring-[#0B2A6F] outline-none"><Plus className="w-4 h-4" /></button>
        </div>
        <button
          disabled={out}
          onClick={() => { onAdd(product, qty); setQty(1); }}
          className="flex-1 h-11 rounded-xl bg-[#0B2A6F] text-white font-semibold text-sm disabled:opacity-40 hover:bg-[#0B2A6F]/90 active:scale-[0.98] transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2A6F] outline-none"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}