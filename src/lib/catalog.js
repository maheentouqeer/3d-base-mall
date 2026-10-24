export const SLOTS_PER_AISLE = 12;
export const BOXES_PER_SLOT = 12;
export const CAPACITY = 60;
export const TAX_RATE = 0.08;

export const CATEGORIES = [
  { key: 'beauty', name: 'Beauty', code: 'BEA', items: [
    ['Silk Petal Face Wash', 8.5], ['Dew Drop Moisturiser', 12], ['Lumi Glow Serum', 19.9], ['Cloud Soft Shampoo', 7.25],
    ['Velvet Rinse Conditioner', 7.25], ['Rosewater Mist', 9], ['Sunveil SPF 30 Lotion', 13.5], ['Berry Balm Lip Care', 3.5],
    ['Calm Clay Face Mask', 6.75], ['Fresh Fern Deodorant', 5.5], ['Nova Soft Hand Cream', 6], ['Peak Mint Toothpaste', 4.25]] },
  { key: 'pharmacy', name: 'Pharmacy', code: 'PHA', items: [
    ['Pain Relief Tablets 20 pack', 4.99], ['Allergy Relief Tablets 14 pack', 7.49], ['Adhesive Plasters 40 pack', 3.99],
    ['Honey Lemon Cough Syrup 100ml', 6.49], ['Antiseptic Wipes 30 pack', 3.25], ['Vitamin C Chewables 60 pack', 8.99],
    ['Daily Multivitamin 90 pack', 12.49], ['Digestive Comfort Tablets 24 pack', 5.79], ['Digital Thermometer', 9.99],
    ['Cotton Pads 100 pack', 2.49], ['Saline Nasal Spray 15ml', 4.79], ['Hand Sanitiser Gel', 2.99]] },
  { key: 'food', name: 'Food', code: 'FOO', items: [
    ['Sunrise Oat Flakes 500g', 3.2], ['Golden Grain Pasta 1kg', 2.4], ['Tomato Basil Sauce', 4.1], ['Olive Grove Olive Oil 500ml', 8.9],
    ['Hearth Sourdough Loaf', 3.8], ['Farmhand Free-range Eggs 12', 4.6], ['Maple Crunch Granola', 4.5], ['Sea Salt Crisps', 2.2],
    ['Orchard Peanut Butter', 3.9], ['Red Lentil Soup', 2.8], ['Basmati Rice 2kg', 5.6], ['Dark Cocoa Biscuits', 2.7]] },
  { key: 'drinks', name: 'Drinks', code: 'DRI', items: [
    ['Spring Peak Still Water 6 pack', 3.6], ['Fizz Lime Sparkling 6 pack', 4.2], ['Orchard Apple Juice 1L', 2.9], ['Cold Brew Coffee 750ml', 5.5],
    ['Jasmine Green Tea Bottle', 2.1], ['Citrus Burst Soda 2L', 2.4], ['Oat Barista Drink 1L', 2.8], ['Berry Kombucha 330ml', 3.4],
    ['Ginger Zing Beer 4 pack', 5.2], ['Iced Mocha Can', 2.6], ['Coconut Water 1L', 3.7], ['Sports Hydrate Blue 750ml', 2.3]] },
  { key: 'apparel', name: 'Apparel', code: 'APP', items: [
    ['Everyday Cotton Tee', 12], ['Soft Crew Socks 5 pack', 9.5], ['Canvas Tote Bag', 8], ['Weekend Hoodie', 34], ['Slim Stretch Jeans', 39],
    ['Rain Shell Jacket', 49], ['Knit Beanie', 11], ['Linen Shirt', 29], ['Running Shorts', 18], ['Cosy Fleece Scarf', 15],
    ['Navy Cap', 13], ['Sleep Pyjama Set', 27]] },
  { key: 'electronics', name: 'Electronics', code: 'ELE', items: [
    ['USB-C Cable 1m', 7.5], ['Fast Wall Charger 20W', 14], ['Wireless Earbuds Lite', 39], ['Power Bank 10000mAh', 24],
    ['Bluetooth Speaker Mini', 29], ['Smart LED Bulb 2 pack', 15], ['Aluminium Phone Stand', 11], ['HDMI Cable 2m', 9],
    ['USB Desk Lamp', 19], ['HD Webcam', 33], ['Wireless Mouse', 17], ['Compact Keyboard', 59]] },
  { key: 'home', name: 'Home', code: 'HOM', items: [
    ['Lemon Dish Soap 500ml', 2.8], ['Laundry Pods 30 pack', 11.5], ['Bamboo Sponge Pack', 3.6], ['Glass Cleaner Spray', 3.4],
    ['Fresh Pine Floor Cleaner', 3.9], ['Kitchen Roll 4 pack', 5.2], ['Bin Bags 50 pack', 4.6], ['Cedar Scented Candle', 9],
    ['Microfibre Cloths 6 pack', 4.8], ['Fabric Softener 1.5L', 4.4], ['Toilet Roll 9 pack', 6.9], ['All-Purpose Spray', 3.1]] },
  { key: 'kids', name: 'Kids', code: 'KID', items: [
    ['Wooden Building Blocks', 24], ['Colour Crayons 24 pack', 4.5], ['Biscuit the Plush Bear', 14], ['Little Fox Picture Book', 7.5],
    ['Bath Duck Trio', 5.5], ['Sketch Pad A4', 3.9], ['Kids Water Bottle', 8], ['Puzzle 48 pieces', 9],
    ['Dino Lunch Box', 11], ['Gentle Baby Wipes 80 pack', 3.2], ['Sticker Fun Pack', 2.5], ['Toy Train Set', 29]] },
];

export const CATALOG = CATEGORIES.flatMap((c, i) =>
  c.items.map(([name, price], j) => {
    const n = i * 12 + j;
    return {
      sku: `${c.code}-${String(j + 1).padStart(2, '0')}`,
      name, price, category: c.name, aisle: i, slot: j,
      qty: n % 11 === 3 ? 4 : 18 + ((n * 7) % 43),
      min_qty: 10,
      sale_pct: n % 13 === 5 ? 20 : 0,
    };
  })
);

export const CATALOG_INDEX = Object.fromEntries(CATALOG.map((p, n) => [p.sku, n]));

export const shelfZ = (aisle) => -13 + aisle * 2.9;
export const slotX = (slot) => -9 + 0.75 + slot * 1.5;
export const COUNTER_XS = [-9, -3, 3, 9];
export const COUNTER_Z = 11.5;

export const unitPrice = (p) => +(p.price * (1 - (p.sale_pct || 0) / 100)).toFixed(2);
export const money = (n) => `$${(+n).toFixed(2)}`;