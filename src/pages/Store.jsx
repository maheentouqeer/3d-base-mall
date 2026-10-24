import React, { lazy, Suspense, useRef, useState, useMemo, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import useStoreData from '@/lib/useStoreData';
import { CATALOG } from '@/lib/catalog';
import TopBar from '@/components/store/TopBar';
import ProductCard from '@/components/store/ProductCard';
import CartDrawer, { cartTotals } from '@/components/store/CartDrawer';
import CheckoutDialog from '@/components/store/CheckoutDialog';
import ManagerPanel from '@/components/store/ManagerPanel';
import Minimap from '@/components/store/Minimap';
import Joystick from '@/components/store/Joystick';

const StoreScene = lazy(() => import('@/components/store/StoreScene'));

export default function Store() {
  const { products, update } = useStoreData();
  const [cart, setCart] = useState({});
  const [pickedSku, setPickedSku] = useState(null);
  const [manager, setManager] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [paying, setPaying] = useState(false);
  const [help, setHelp] = useState(true);
  const api = useRef(null);
  const playerRef = useRef({ x: 0, z: 13.5, yaw: 0 });

  const picked = products.find((p) => p.sku === pickedSku);
  const lines = useMemo(
    () => products.filter((p) => cart[p.sku]).map((p) => ({ product: p, qty: cart[p.sku] })),
    [products, cart]
  );
  const cartCount = lines.reduce((s, l) => s + l.qty, 0);
  const lowCount = products.filter((p) => p.qty <= (p.min_qty ?? 10)).length;

  const onPick = useCallback((idx) => { setPickedSku(CATALOG[idx].sku); setHelp(false); }, []);
  const flyToProduct = (idx) => { api.current?.flyToSlot(idx); setPickedSku(CATALOG[idx].sku); };

  const toggleManager = async () => {
    if (manager) { setManager(false); setPickedSku(null); return; }
    if (!(await base44.auth.isAuthenticated())) { base44.auth.redirectToLogin(window.location.pathname); return; }
    setManager(true); setPickedSku(null);
  };

  const setQty = (sku, qty) => setCart((c) => {
    const next = { ...c };
    if (qty <= 0) delete next[sku]; else next[sku] = qty;
    return next;
  });
  const addToCart = (p, qty) => { setQty(p.sku, Math.min((cart[p.sku] || 0) + qty, p.qty)); setPickedSku(null); setDrawer(true); };

  const goCheckout = () => {
    setDrawer(false);
    api.current?.flyToCounter();
    api.current?.setBelt(cartCount);
    setTimeout(() => setPaying(true), 1500);
  };

  const pay = async (method, t) => {
    const order = await base44.entities.Order.create({
      order_number: `HM-${Date.now().toString().slice(-6)}`,
      items: lines.map(({ product, qty }) => ({ sku: product.sku, name: product.name, qty, price: product.price })),
      ...t,
      payment_method: method,
    });
    await Promise.all(lines.map(({ product, qty }) => update(product, { qty: Math.max(0, product.qty - qty) })));
    return order;
  };

  const done = () => { setPaying(false); setCart({}); api.current?.setBelt(0); };

  return (
    <div className="fixed inset-0 bg-[#F6F4EE] overflow-hidden font-['Inter'] select-none">
      <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-[#0B2A6F] text-white font-['Bricolage_Grotesque'] text-3xl font-extrabold">Opening Haven Market…</div>}>
        <StoreScene products={products} manager={manager} onPick={onPick} apiRef={api} playerRef={playerRef} />
      </Suspense>

      <TopBar
        products={products} cartCount={cartCount} onCart={() => setDrawer(true)}
        onSearchPick={(idx) => { setManager(false); flyToProduct(idx); }}
        onCategory={(i) => api.current?.flyToAisle(i)}
        manager={manager} onToggleManager={toggleManager} lowCount={lowCount}
      />
      <Minimap playerRef={playerRef} />
      <Joystick onMove={(x, y) => api.current?.setJoystick(x, y)} />

      {help && (
        <div className="absolute z-10 top-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-4 py-2 text-xs sm:text-sm text-[#14213D] shadow-lg flex items-center gap-3">
          <span>Drag to look · W A S D or joystick to walk · click a product</span>
          <button onClick={() => setHelp(false)} className="font-semibold text-[#0B2A6F]">Got it</button>
        </div>
      )}

      {manager
        ? <ManagerPanel products={products} selected={picked} onSelect={(sku) => { flyToProduct(CATALOG.findIndex((c) => c.sku === sku)); }} onSave={update} />
        : picked && <ProductCard key={picked.sku} product={picked} onClose={() => setPickedSku(null)} onAdd={addToCart} />}

      {drawer && <CartDrawer lines={lines} onClose={() => setDrawer(false)} onQty={setQty} onCheckout={goCheckout} />}
      {paying && <CheckoutDialog lines={lines} onPay={pay} onDone={done} onCancel={() => setPaying(false)} />}
    </div>
  );
}