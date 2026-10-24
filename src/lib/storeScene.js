import * as THREE from 'three';
import {
  CATEGORIES, CATALOG, CATALOG_INDEX, CAPACITY, BOXES_PER_SLOT, SLOTS_PER_AISLE,
  shelfZ, slotX, COUNTER_XS, COUNTER_Z,
} from './catalog';

const PALETTE = ['#4F7CFF', '#F2B84B', '#3FB68B', '#8A6FE8', '#F28C52', '#2EA4C8', '#E8E1D0', '#7BC96F', '#C79BE0', '#F5D547'];
const DISPLAY_FONT = "'Bricolage Grotesque', 'Inter', sans-serif";

function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

function textTexture(text, w, h, bg, fg, size) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.fillStyle = fg; g.font = `700 ${size}px ${DISPLAY_FONT}`;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2 + 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#efece3'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#e4e0d4'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(20, 15);
  t.magFilter = THREE.NearestFilter;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function shortestAngle(from, to) {
  let d = (to - from) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function createStoreScene(container, { onPick, playerRef }) {
  const W = () => container.clientWidth || 800;
  const H = () => container.clientHeight || 600;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.domElement.style.touchAction = 'none';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dfe6f5');
  scene.fog = new THREE.Fog('#dfe6f5', 14, 44);
  const camera = new THREE.PerspectiveCamera(70, W() / H(), 0.1, 80);
  camera.rotation.order = 'YXZ';

  scene.add(new THREE.HemisphereLight('#ffffff', '#c9cfdf', 1.35));
  const sun = new THREE.DirectionalLight('#ffffff', 0.9);
  sun.position.set(8, 14, 6);
  scene.add(sun);

  const lam = (color) => new THREE.MeshLambertMaterial({ color });
  const add = (geo, mat, x, y, z, parent = scene) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };
  const colliders = [];

  // Floor, ceiling, walls
  add(new THREE.PlaneGeometry(40, 30).rotateX(-Math.PI / 2), new THREE.MeshLambertMaterial({ map: floorTexture() }), 0, 0, 0);
  add(new THREE.PlaneGeometry(40, 30).rotateX(Math.PI / 2), lam('#f4f5fa'), 0, 3.6, 0);
  const wallMat = lam('#f3f0e8');
  add(new THREE.BoxGeometry(40, 3.6, 0.3), wallMat, 0, 1.8, -15.15);
  add(new THREE.BoxGeometry(0.3, 3.6, 30), wallMat, -20.15, 1.8, 0);
  add(new THREE.BoxGeometry(0.3, 3.6, 30), wallMat, 20.15, 1.8, 0);
  add(new THREE.BoxGeometry(16.5, 3.6, 0.3), wallMat, -11.75, 1.8, 15.15);
  add(new THREE.BoxGeometry(16.5, 3.6, 0.3), wallMat, 11.75, 1.8, 15.15);
  add(new THREE.BoxGeometry(7, 1, 0.3), lam('#0B2A6F'), 0, 3.1, 15.15);
  add(new THREE.BoxGeometry(0.2, 2.6, 0.35), lam('#0B2A6F'), -3.5, 1.3, 15.15);
  add(new THREE.BoxGeometry(0.2, 2.6, 0.35), lam('#0B2A6F'), 3.5, 1.3, 15.15);
  const promo = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 0.85),
    new THREE.MeshBasicMaterial({ map: textTexture('Welcome to Haven Market', 1024, 136, '#0B2A6F', '#ffffff', 84) })
  );
  promo.position.set(0, 3.1, 14.97);
  promo.rotation.y = Math.PI;
  scene.add(promo);

  // Ceiling lights
  const lightGeo = new THREE.BoxGeometry(2.4, 0.06, 0.5);
  const lights = new THREE.InstancedMesh(lightGeo, new THREE.MeshBasicMaterial({ color: '#ffffff' }), 40);
  let li = 0;
  for (let x = -15; x <= 15; x += 7.5) for (let z = -12; z <= 12; z += 6) {
    const m = new THREE.Matrix4().setPosition(x, 3.57, z);
    lights.setMatrixAt(li++, m);
  }
  lights.count = li;
  lights.frustumCulled = false;
  scene.add(lights);

  // Aisles
  const shelfMat = lam('#ffffff');
  const backMat = lam('#dfe5f2');
  const frameMat = lam('#0B2A6F');
  const slotHits = [];
  const hitGeo = new THREE.BoxGeometry(1.5, 2.2, 0.62);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const boxGeo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const catMeshes = [];
  const markerGeo = new THREE.SphereGeometry(0.1, 12, 8);
  const markerMat = new THREE.MeshBasicMaterial({ color: '#E5322D' });
  const tagGeo = new THREE.BoxGeometry(0.34, 0.15, 0.02);
  const lowMarkers = [];
  const saleTags = [];

  CATEGORIES.forEach((cat, i) => {
    const z = shelfZ(i);
    add(new THREE.BoxGeometry(18.1, 2.2, 0.05), backMat, 0, 1.1, z - 0.27);
    add(new THREE.BoxGeometry(0.08, 2.2, 0.6), frameMat, -9.05, 1.1, z);
    add(new THREE.BoxGeometry(0.08, 2.2, 0.6), frameMat, 9.05, 1.1, z);
    [0.1, 0.8, 1.5, 2.2].forEach((y) => add(new THREE.BoxGeometry(18.1, 0.05, 0.6), shelfMat, 0, y, z));
    colliders.push({ minX: -9.15, maxX: 9.15, minZ: z - 0.32, maxZ: z + 0.32 });

    const inst = new THREE.InstancedMesh(boxGeo, new THREE.MeshLambertMaterial({ color: '#ffffff' }), SLOTS_PER_AISLE * BOXES_PER_SLOT);
    inst.frustumCulled = false;
    inst.userData.aisle = i;
    scene.add(inst);
    catMeshes.push(inst);

    const signTex = textTexture(cat.name, 512, 128, '#0B2A6F', '#ffffff', 80);
    [-6, 6].forEach((x) => {
      const mat = new THREE.MeshBasicMaterial({ map: signTex });
      const front = add(new THREE.PlaneGeometry(3.2, 0.8), mat, x, 3.0, z + 0.05);
      const back = add(new THREE.PlaneGeometry(3.2, 0.8), mat, x, 3.0, z + 0.04);
      back.rotation.y = Math.PI;
      front.position.z = z + 0.06;
      add(new THREE.BoxGeometry(0.03, 0.4, 0.03), frameMat, x - 1.4, 3.4, z + 0.05);
      add(new THREE.BoxGeometry(0.03, 0.4, 0.03), frameMat, x + 1.4, 3.4, z + 0.05);
    });

    for (let j = 0; j < SLOTS_PER_AISLE; j++) {
      const hit = new THREE.Mesh(hitGeo, hitMat);
      hit.position.set(slotX(j), 1.1, z);
      hit.userData = { aisle: i, slot: j, shelfZ: z };
      scene.add(hit);
      hit.updateMatrixWorld(true);
      slotHits.push(hit);

      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(slotX(j), 2.5, z + 0.1);
      marker.visible = false;
      scene.add(marker);
      lowMarkers.push(marker);

      const tag = new THREE.Mesh(tagGeo, markerMat);
      tag.position.set(slotX(j) + 0.5, 0.8, z + 0.32);
      tag.visible = false;
      scene.add(tag);
      saleTags.push(tag);
    }
  });

  // Checkout lanes
  const beltItems = new THREE.Group();
  scene.add(beltItems);
  COUNTER_XS.forEach((x, n) => {
    add(new THREE.BoxGeometry(2.6, 0.95, 0.9), lam('#ffffff'), x, 0.475, COUNTER_Z);
    add(new THREE.BoxGeometry(2.62, 0.08, 0.92), frameMat, x, 0.95, COUNTER_Z);
    add(new THREE.BoxGeometry(1.6, 0.04, 0.6), lam('#2a2f3d'), x - 0.35, 1.0, COUNTER_Z - 0.05);
    add(new THREE.BoxGeometry(0.34, 0.26, 0.22), lam('#14213D'), x + 0.95, 1.12, COUNTER_Z + 0.1);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.9),
      new THREE.MeshBasicMaterial({ map: textTexture(String(n + 1), 128, 128, '#0B2A6F', '#ffffff', 90) })
    );
    sign.position.set(x, 2.9, COUNTER_Z);
    sign.rotation.y = Math.PI;
    scene.add(sign);
    add(new THREE.BoxGeometry(0.03, 0.7, 0.03), frameMat, x, 3.25, COUNTER_Z);
    colliders.push({ minX: x - 1.35, maxX: x + 1.35, minZ: COUNTER_Z - 0.5, maxZ: COUNTER_Z + 0.5 });
  });

  // Stock rendering
  const stock = {};
  const baseColors = CATALOG.map((p) => new THREE.Color(PALETTE[hash(p.sku) % PALETTE.length]));
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  let managerMode = false;
  let hovered = -1;

  function paintSlot(idx, bright) {
    const mesh = catMeshes[Math.floor(idx / SLOTS_PER_AISLE)];
    const slot = idx % SLOTS_PER_AISLE;
    const c = baseColors[idx].clone();
    if (bright) c.lerp(new THREE.Color('#ffffff'), 0.45);
    for (let k = 0; k < BOXES_PER_SLOT; k++) mesh.setColorAt(slot * BOXES_PER_SLOT + k, c);
    mesh.instanceColor.needsUpdate = true;
  }

  function refreshSlot(idx) {
    const base = CATALOG[idx];
    const p = stock[base.sku] || base;
    const mesh = catMeshes[base.aisle];
    const h = hash(base.sku);
    const w = 0.26 + (h % 3) * 0.03;
    const hg = 0.28 + ((h >> 1) % 5) * 0.07;
    const visible = p.qty <= 0 ? 0 : Math.min(BOXES_PER_SLOT, Math.max(1, Math.ceil((p.qty / CAPACITY) * BOXES_PER_SLOT)));
    for (let k = 0; k < BOXES_PER_SLOT; k++) {
      const level = Math.floor(k / 4);
      const col = k % 4;
      tmpM.compose(
        new THREE.Vector3(slotX(base.slot) - 0.54 + col * 0.36, 0.125 + level * 0.7, shelfZ(base.aisle) + 0.02),
        tmpQ,
        new THREE.Vector3(k < visible ? w : 0.0001, k < visible ? hg : 0.0001, k < visible ? 0.28 : 0.0001)
      );
      mesh.setMatrixAt(base.slot * BOXES_PER_SLOT + k, tmpM);
    }
    mesh.instanceMatrix.needsUpdate = true;
    paintSlot(idx, idx === hovered);
    lowMarkers[idx].visible = managerMode && p.qty <= (p.min_qty ?? 10);
    saleTags[idx].visible = (p.sale_pct || 0) > 0;
  }

  function applyProducts(list) {
    list.forEach((p) => { stock[p.sku] = p; });
    CATALOG.forEach((_, idx) => refreshSlot(idx));
  }

  function setManager(on) {
    managerMode = on;
    CATALOG.forEach((_, idx) => refreshSlot(idx));
  }

  function setBelt(n) {
    beltItems.clear();
    const x = COUNTER_XS[1];
    for (let k = 0; k < Math.min(n, 8); k++) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.22), lam(PALETTE[(k * 3) % PALETTE.length]));
      m.position.set(x - 1.0 + k * 0.2, 1.14, COUNTER_Z - 0.05);
      beltItems.add(m);
    }
  }

  // Player + controls
  const p = { x: 0, z: 13.5, yaw: 0, pitch: 0, vx: 0, vz: 0, bob: 0 };
  const keys = {};
  const joy = { x: 0, y: 0 };
  let fly = null;
  const pointer = { x: 0, y: 0, inside: false };
  let drag = null;

  const down = (e) => { if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return; keys[e.code] = true; };
  const up = (e) => { keys[e.code] = false; };
  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);

  const dom = renderer.domElement;
  dom.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    dom.setPointerCapture(e.pointerId);
  });
  dom.addEventListener('pointermove', (e) => {
    const r = dom.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointer.inside = true;
    if (!drag || fly) return;
    p.yaw -= (e.clientX - drag.x) * 0.004;
    p.pitch = Math.max(-1.1, Math.min(1.1, p.pitch - (e.clientY - drag.y) * 0.004));
    drag.x = e.clientX; drag.y = e.clientY;
  });
  dom.addEventListener('pointerleave', () => { pointer.inside = false; });
  dom.addEventListener('pointerup', (e) => {
    if (drag && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) {
      const r = dom.getBoundingClientRect();
      const hit = pickAt(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (hit) onPick(hit.aisle * SLOTS_PER_AISLE + hit.slot);
    }
    drag = null;
  });

  const ray = new THREE.Raycaster();
  function pickAt(nx, ny) {
    ray.setFromCamera({ x: nx, y: ny }, camera);
    const hits = ray.intersectObjects(slotHits, false).filter((h) => camera.position.z > h.object.userData.shelfZ);
    return hits.length ? hits[0].object.userData : null;
  }

  function collides(x, z) {
    if (x < -19.5 || x > 19.5 || z < -14.5 || z > 14.6) return true;
    const r = 0.4;
    return colliders.some((b) => x > b.minX - r && x < b.maxX + r && z > b.minZ - r && z < b.maxZ + r);
  }

  function flyTo(x, z, lookX, lookY, lookZ, dur = 1.4) {
    const tyaw = Math.atan2(-(lookX - x), -(lookZ - z));
    const tpitch = Math.atan2(lookY - 1.65, Math.hypot(lookX - x, lookZ - z));
    fly = { sx: p.x, sz: p.z, sy: p.yaw, sp: p.pitch, tx: x, tz: z, dy: shortestAngle(p.yaw, tyaw), tp: tpitch, t: 0, dur };
  }

  const clock = new THREE.Clock();
  let raf = 0;
  let frame = 0;
  let time = 0;

  function loop() {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05);
    time += dt;
    frame++;

    if (fly) {
      fly.t += dt / fly.dur;
      const k = Math.min(fly.t, 1);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      p.x = fly.sx + (fly.tx - fly.sx) * e;
      p.z = fly.sz + (fly.tz - fly.sz) * e;
      p.yaw = fly.sy + fly.dy * e;
      p.pitch = fly.sp + (fly.tp - fly.sp) * e;
      if (k >= 1) fly = null;
    } else {
      const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0) - joy.y;
      const s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + joy.x;
      p.yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 1.8 * dt;
      const tvx = (-Math.sin(p.yaw) * f + Math.cos(p.yaw) * s) * 4.2;
      const tvz = (-Math.cos(p.yaw) * f - Math.sin(p.yaw) * s) * 4.2;
      const a = Math.min(1, dt * 9);
      p.vx += (tvx - p.vx) * a;
      p.vz += (tvz - p.vz) * a;
      const nx = p.x + p.vx * dt;
      if (!collides(nx, p.z)) p.x = nx; else p.vx = 0;
      const nz = p.z + p.vz * dt;
      if (!collides(p.x, nz)) p.z = nz; else p.vz = 0;
    }

    const speed = Math.hypot(p.vx, p.vz);
    p.bob += speed * dt * 2.2;
    camera.position.set(p.x, 1.65 + Math.sin(p.bob) * 0.03 * Math.min(1, speed / 4.2), p.z);
    camera.rotation.set(p.pitch, p.yaw, 0);
    camera.updateMatrixWorld();
    playerRef.current = { x: p.x, z: p.z, yaw: p.yaw };

    if (frame % 3 === 0 && pointer.inside && !drag && !fly) {
      const hit = pickAt(pointer.x, pointer.y);
      const idx = hit ? hit.aisle * SLOTS_PER_AISLE + hit.slot : -1;
      if (idx !== hovered) {
        const prev = hovered;
        hovered = idx;
        if (prev >= 0) paintSlot(prev, false);
        if (idx >= 0) paintSlot(idx, true);
        dom.style.cursor = idx >= 0 ? 'pointer' : 'grab';
      }
    }

    const pulse = 1 + 0.35 * Math.sin(time * 5);
    lowMarkers.forEach((m) => { if (m.visible) m.scale.setScalar(pulse); });
    renderer.render(scene, camera);
  }
  loop();

  const ro = new ResizeObserver(() => {
    renderer.setSize(W(), H());
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
  });
  ro.observe(container);

  return {
    applyProducts,
    setManager,
    setBelt,
    setJoystick: (x, y) => { joy.x = x; joy.y = y; },
    flyToSlot: (idx) => {
      const b = CATALOG[idx];
      const x = slotX(b.slot);
      flyTo(x, shelfZ(b.aisle) + 1.6, x, 1.2, shelfZ(b.aisle));
    },
    flyToAisle: (i) => flyTo(-9.5, shelfZ(i) + 1.5, 0, 1.3, shelfZ(i)),
    flyToCounter: () => flyTo(COUNTER_XS[1], COUNTER_Z - 2.2, COUNTER_XS[1], 1.0, COUNTER_Z, 1.6),
    dispose: () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      ro.disconnect();
      renderer.dispose();
      if (dom.parentNode) dom.parentNode.removeChild(dom);
    },
    indexOf: (sku) => CATALOG_INDEX[sku],
  };
}