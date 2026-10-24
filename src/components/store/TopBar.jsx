import React, { useState } from 'react';
import { Search, ShoppingCart, LayoutGrid, ShieldCheck } from 'lucide-react';
import { CATEGORIES, CATALOG_INDEX } from '@/lib/catalog';

export default function TopBar({ products, cartCount, onCart, onSearchPick, onCategory, manager, onToggleManager, lowCount }) {
  const [q, setQ] = useState('');
  const results = q.trim().length > 1
    ? products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6)
    : [];

  return (
    <header className="absolute top-0 inset-x-0 z-20 flex items-center gap-2 sm:gap-4 px-3 sm:px-6 h-16 bg-white/75 backdrop-blur-xl border-b border-[#0B2A6F]/10">
      <div className="font-['Bricolage_Grotesque'] font-extrabold text-xl text-[#0B2A6F] tracking-tight shrink-0">
        Haven<span className="hidden sm:inline"> Market</span>
      </div>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#14213D]/50" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#F6F4EE] text-sm text-[#14213D] outline-none focus-visible:ring-2 focus-visible:ring-[#0B2A6F]"
        />
        {results.length > 0 && (
          <div className="absolute top-12 inset-x-0 bg-white rounded-xl shadow-xl border border-[#0B2A6F]/10 overflow-hidden">
            {results.map((p) => (
              <button
                key={p.sku}
                onClick={() => { onSearchPick(CATALOG_INDEX[p.sku]); setQ(''); }}
                className="w-full flex justify-between gap-3 px-4 min-h-[44px] items-center text-left text-sm text-[#14213D] hover:bg-[#F6F4EE] focus-visible:bg-[#F6F4EE] outline-none"
              >
                <span className="truncate">{p.name}</span>
                <span className="text-xs text-[#14213D]/50 shrink-0">{p.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative group hidden md:block">
        <button className="h-11 px-3 rounded-xl flex items-center gap-2 text-sm font-medium text-[#0B2A6F] hover:bg-[#F6F4EE] focus-visible:ring-2 focus-visible:ring-[#0B2A6F] outline-none">
          <LayoutGrid className="w-4 h-4" /> Aisles
        </button>
        <div className="absolute right-0 top-11 pt-2 hidden group-hover:block group-focus-within:block">
          <div className="bg-white rounded-xl shadow-xl border border-[#0B2A6F]/10 p-1 w-44">
            {CATEGORIES.map((c, i) => (
              <button key={c.key} onClick={() => onCategory(i)} className="w-full text-left px-3 min-h-[40px] rounded-lg text-sm text-[#14213D] hover:bg-[#F6F4EE]">
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onToggleManager}
        className={`h-11 px-3 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#0B2A6F] outline-none ${manager ? 'bg-[#0B2A6F] text-white' : 'text-[#0B2A6F] hover:bg-[#F6F4EE]'}`}
      >
        <ShieldCheck className="w-4 h-4" />
        <span className="hidden sm:inline">{manager ? 'Manager' : 'Manager mode'}</span>
        {manager && lowCount > 0 && <span className="bg-[#E5322D] text-white text-xs rounded-full px-1.5 font-['JetBrains_Mono']">{lowCount}</span>}
      </button>

      <button
        onClick={onCart}
        aria-label="Open cart"
        className="relative h-11 w-11 shrink-0 rounded-xl bg-[#0B2A6F] text-white flex items-center justify-center hover:bg-[#0B2A6F]/90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0B2A6F] outline-none"
      >
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-white text-[#0B2A6F] border-2 border-[#0B2A6F] text-xs font-bold flex items-center justify-center font-['JetBrains_Mono']">
            {cartCount}
          </span>
        )}
      </button>
    </header>
  );
}