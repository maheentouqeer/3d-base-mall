import React, { useEffect, useRef } from 'react';
import { createStoreScene } from '@/lib/storeScene';

export default function StoreScene({ products, manager, onPick, apiRef, playerRef }) {
  const container = useRef(null);
  const latest = useRef({ products, manager, onPick });
  latest.current = { products, manager, onPick };

  useEffect(() => {
    const api = createStoreScene(container.current, {
      onPick: (idx) => latest.current.onPick(idx),
      playerRef,
    });
    api.applyProducts(latest.current.products);
    api.setManager(latest.current.manager);
    apiRef.current = api;
    return () => { api.dispose(); apiRef.current = null; };
  }, [apiRef, playerRef]);

  useEffect(() => { apiRef.current?.applyProducts(products); }, [products, apiRef]);
  useEffect(() => { apiRef.current?.setManager(manager); }, [manager, apiRef]);

  return <div ref={container} className="absolute inset-0 cursor-grab" />;
}