import React, { useEffect, useState } from 'react';
import { AlertTriangle, PackagePlus } from 'lucide-react';

function Editor({ product, onSave }) {
  const [f, setF] = useState(product);
  useEffect(() => setF(product), [product]);
  const set = (k) => (e) => setF({ ...f, [k]: +e.target.value });
  const field = (label, k) => (
    <label className="text-xs text-[#14213D]/60">
      {label}
      <input type="number" min="0" step={k === 'price' ? '0.01' : '1'} value={f[k] ?? 0} onChange={set(k)}
        className="mt-1 w-full h-10 px-2 rounded-lg bg-[#F6F4EE] text-sm font-['JetBrains_Mono'] text-[#14213D] outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A6F]" />
    </label>
  );
  return (
    <div className="p-4 border-t border-[#0B2A6F]/10 space-y-3">
      <div>
        <p className="font-['JetBrains_Mono'] text-xs text-[#14213D]/50">{product.sku}</p>
        <p className="font-semibold text-[#14213D]">{product.name}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {field('Price ($)', 'price')}{field('Quantity', 'qty')}
        {field('Reorder level', 'min_qty')}{field('Sale %', 'sale_pct')}
      </div>
      <div className="flex gap-2">
        <button onClick={() => setF({ ...f, qty: (f.qty || 0) + 24 })} className="h-11 px-3 rounded-xl bg-[#F6F4EE] text-sm font-medium flex items-center gap-1.5"><PackagePlus className="w-4 h-4" />+24</button>
        <button onClick={() => onSave(product, { price: f.price, qty: f.qty, min_qty: f.min_qty, sale_pct: f.sale_pct })} className="flex-1 h-11 rounded-xl bg-[#0B2A6F] text-white font-semibold text-sm">Save changes</button>
      </div>
    </div>
  );
}

export default function ManagerPanel({ products, selected, onSelect, onSave }) {
  const low = products.filter((p) => p.qty <= (p.min_qty ?? 10)).sort((a, b) => a.qty - b.qty);
  return (
    <aside className="absolute z-30 top-20 right-3 w-[calc(100%-24px)] max-w-xs bg-white/95 backdrop-blur rounded-2xl shadow-2xl overflow-hidden max-h-[calc(100%-110px)] flex flex-col">
      <div className="px-4 py-3 flex items-center gap-2 bg-[#0B2A6F] text-white">
        <AlertTriangle className="w-4 h-4" />
        <h2 className="font-['Bricolage_Grotesque'] font-bold">Low stock · {low.length}</h2>
      </div>
      <div className="overflow-y-auto min-h-[60px]">
        {low.length === 0 && <p className="p-4 text-sm text-[#14213D]/60">Everything is well stocked.</p>}
        {low.map((p) => (
          <button key={p.sku} onClick={() => onSelect(p.sku)}
            className={`w-full flex items-center justify-between gap-2 px-4 min-h-[44px] text-left text-sm hover:bg-[#F6F4EE] ${selected?.sku === p.sku ? 'bg-[#F6F4EE]' : ''}`}>
            <span className="truncate text-[#14213D]">{p.name}</span>
            <span className="shrink-0 text-xs font-bold text-[#E5322D] font-['JetBrains_Mono']">{p.qty} left</span>
          </button>
        ))}
      </div>
      {selected ? <Editor product={selected} onSave={onSave} /> : (
        <p className="p-4 border-t text-xs text-[#14213D]/60">Click any shelf to edit price, quantity or reorder level. Red pulsing dots mark low stock.</p>
      )}
    </aside>
  );
}