import { useEffect, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { CATALOG } from '@/lib/catalog';

let seeding = null;

const merge = (rows) => {
  const bySku = Object.fromEntries(rows.map((r) => [r.sku, r]));
  return CATALOG.map((c) => ({ ...c, ...(bySku[c.sku] || {}) }));
};

async function loadOrSeed() {
  let page = await base44.entities.Product.list({ limit: 300 });
  if (page.items.length === 0) {
    if (!seeding) {
      seeding = base44.entities.Product.bulkCreate(
        CATALOG.map(({ sku, name, category, price, qty, min_qty, sale_pct }) => ({ sku, name, category, price, qty, min_qty, sale_pct }))
      );
    }
    await seeding;
    page = await base44.entities.Product.list({ limit: 300 });
  }
  return page.items;
}

export default function useStoreData() {
  const [products, setProducts] = useState(CATALOG);

  useEffect(() => {
    let unsub = () => {};
    loadOrSeed().then((rows) => setProducts(merge(rows)));
    unsub = base44.entities.Product.subscribe((event) => {
      setProducts((prev) =>
        prev.map((p) => (p.sku === event.data?.sku ? { ...p, ...event.data } : p))
      );
    });
    return () => unsub();
  }, []);

  const update = useCallback(async (product, patch) => {
    setProducts((prev) => prev.map((p) => (p.sku === product.sku ? { ...p, ...patch } : p)));
    if (product.id) await base44.entities.Product.update(product.id, patch);
  }, []);

  return { products, update };
}