/**
 * Central Inventory & Product Catalog for Pharmacy Store
 * Pure Frontend Data Management with LocalStorage persistence
 */

const DEFAULT_PRODUCTS = [
  {
    "id": "apoth-01",
    "name": "Sleep Meditation Drops",
    "category": "Herbal Tinctures",
    "brand": "Apothecary Sanctuary",
    "price": 499,
    "originalPrice": 699,
    "rating": 5,
    "reviewsCount": 84,
    "stock": 24,
    "availability": "In Stock",
    "productType": "Drops",
    "quantity": "50 ml",
    "collection": "Everyday Wellness",
    "badge": "BESTSELLER",
    "image": "assets/fav-sleep-drops.webp",
    "description": "Deep restorative botanical sleep tincture formulated with organic valerian root, passionflower, and English lavender to encourage restorative circadian sleep cycles.",
    "ingredients": "Organic Valerian Root Extract, Passionflower Aerial Parts, English Lavender Blossoms, USP Vegetable Glycerin, Distilled Mountain Water.",
    "usage": "Take 1-2 full droppers under the tongue 30 minutes before sleep or blend into warm chamomile tea.",
    "benefits": "Relieves nervous tension, encourages deep REM sleep, non-habit forming.",
    "storage": "Store in a cool dry dark cupboard. Shake well before use.",
    "shipping": "Dispatched in 24 hours. Express temperature-monitored shipping available.",
    "returns": "30-day satisfaction guarantee. Seal intact returns accepted."
  },
  {
    "id": "apoth-02",
    "name": "Immunity Protection Elixir",
    "category": "Elixirs & Tonics",
    "brand": "Apothecary Sanctuary",
    "price": 649,
    "originalPrice": 849,
    "rating": 4.9,
    "reviewsCount": 112,
    "stock": 19,
    "availability": "In Stock",
    "productType": "Elixir",
    "quantity": "100 ml",
    "collection": "Immunity & Vitality",
    "badge": "STAFF PICK",
    "image": "assets/fav-immunity-elixir.webp",
    "description": "Concentrated botanical tonic infused with elderberry, organic echinacea, and wild forest reishi to strengthen daily cellular defense and respiratory vitality.",
    "ingredients": "Wild Black Elderberry, Echinacea Purpurea, Reishi Mushroom Dual Extract, Raw Clover Honey, Ginger Root.",
    "usage": "Take 1 tablespoon daily for maintenance, or up to 3 times daily during seasonal shifts.",
    "benefits": "Potent antioxidant barrier, supports upper respiratory health, boosts white blood cell response.",
    "storage": "Store in cool pantry. Refrigerate after opening for best freshness.",
    "shipping": "Dispatched in 24 hours. Express shipping available.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-03",
    "name": "Pure Revitalizing Tea Blend",
    "category": "Organic Teas",
    "brand": "Apothecary Sanctuary",
    "price": 349,
    "originalPrice": 499,
    "rating": 4.8,
    "reviewsCount": 95,
    "stock": 35,
    "availability": "In Stock",
    "productType": "Loose Leaf",
    "quantity": "85g Tin",
    "collection": "Everyday Wellness",
    "badge": "POPULAR",
    "image": "assets/fav-tea-blend.webp",
    "description": "Artisan loose-leaf botanical tea blending hand-harvested spearmint, lemon verbena, and holy basil for sustained calm energy and digestion balance.",
    "ingredients": "Organic Spearmint Leaf, Lemon Verbena, Rama & Krishna Tulsi (Holy Basil), Calendula Petals.",
    "usage": "Steep 1 heaped teaspoon in 200ml freshly boiled water (95°C) for 5-7 minutes. Sip slowly.",
    "benefits": "Soothes digestion, clears mental fog, zero artificial flavors or caffeine.",
    "storage": "Keep airtight in decorative tin away from direct sunlight.",
    "shipping": "Standard delivery 2-3 business days.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-04",
    "name": "Calming Herbal Face Oil",
    "category": "Botanical Skincare",
    "brand": "Sanctuary Botanicals",
    "price": 529,
    "originalPrice": 729,
    "rating": 5,
    "reviewsCount": 136,
    "stock": 15,
    "availability": "In Stock",
    "productType": "Face Oil",
    "quantity": "30 ml",
    "collection": "Skin Sanctuary",
    "badge": "LIMITED HARVEST",
    "image": "assets/fav-face-oil.webp",
    "description": "Cold-pressed golden jojoba and blue tansy lipid serum designed to restore compromised epidermal barriers, calm redness, and nourish dry skin.",
    "ingredients": "Organic Golden Jojoba Seed Oil, Rosehip Seed CO2 Extract, Blue Tansy Flower Oil, Squalane, Vitamin E.",
    "usage": "Warm 3-4 drops between clean palms and press gently into damp face and neck morning and evening.",
    "benefits": "Deep lipid barrier repair, visibly reduces facial redness, radiant dewy finish.",
    "storage": "Store away from heat and direct UV light.",
    "shipping": "Dispatched in 24 hours in insulated packaging.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-05",
    "name": "Amazonian Rain Revive",
    "category": "Exotic Formulations",
    "brand": "Aura BioCare",
    "price": 899,
    "originalPrice": 1199,
    "rating": 4.9,
    "reviewsCount": 68,
    "stock": 12,
    "availability": "In Stock",
    "productType": "Elixir",
    "quantity": "60 ml",
    "collection": "Exotic Harvests",
    "badge": "RARE FIND",
    "image": "assets/amazonian-rain-revive.webp",
    "description": "Rare biodynamic Amazonian botanical concentrate featuring wildcrafted Camu Camu, Guayusa, and Brazilian copaiba resin for high-potency cellular regeneration.",
    "ingredients": "Wild Amazonian Camu Camu Extract, Guayusa Leaf, Copaiba Oleoresin, Dragons Blood Sap, Cane Spirit.",
    "usage": "Add 15 drops to water or fresh citrus juice once daily.",
    "benefits": "Concentrated natural Vitamin C, cellular renewal, invigorating sustained clean stamina.",
    "storage": "Keep in dark cool cupboard.",
    "shipping": "Express courier delivery.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-06",
    "name": "Himalayan Peak Vitality",
    "category": "Exotic Formulations",
    "brand": "Himalayan Herbal",
    "price": 1199,
    "originalPrice": 1599,
    "rating": 5,
    "reviewsCount": 154,
    "stock": 8,
    "availability": "Low Stock",
    "productType": "Resin",
    "quantity": "40g Jar",
    "collection": "Exotic Harvests",
    "badge": "HIGH ALTITUDE",
    "image": "assets/himalayan-peak-vitality.webp",
    "description": "Gold-grade purified Himalayan Shilajit resin enriched with wild cordyceps and high-altitude rhododendron honey for peak stamina and mitochondrial ATP.",
    "ingredients": "100% Pure Himalayan Shilajit (60%+ Fulvic Acid), Wild Cordyceps Sinensis Extract, Pure Mountain Honey.",
    "usage": "Dissolve a pea-sized amount (300-500mg) in warm herbal milk or hot water each morning.",
    "benefits": "Mitochondrial energy enhancement, 85+ ionic trace minerals, cognitive stamina.",
    "storage": "Keep container tightly sealed in a cool environment.",
    "shipping": "Secure tracked priority dispatch.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-07",
    "name": "Golden Ashwagandha Adaptogen Tonic",
    "category": "Herbal Tinctures",
    "brand": "Apothecary Sanctuary",
    "price": 679,
    "originalPrice": 899,
    "rating": 4.9,
    "reviewsCount": 77,
    "stock": 22,
    "availability": "In Stock",
    "productType": "Drops",
    "quantity": "60 ml",
    "collection": "Everyday Wellness",
    "badge": "ADAPTOGEN",
    "image": "assets/exotic-adaptogen.webp",
    "description": "Full-spectrum KSM-66 organic Ashwagandha root dual-extracted with holy basil and black pepper for balanced cortisol response and nervous system resilience.",
    "ingredients": "Organic Ashwagandha Root (Withania Somnifera), Holy Basil Leaf, Organic Piperine, Vegetable Glycerin.",
    "usage": "Take 1 full dropper twice daily before meals or during stressful periods.",
    "benefits": "Modulates elevated cortisol, relieves chronic fatigue, promotes emotional balance.",
    "storage": "Cool dry pantry.",
    "shipping": "Dispatched within 24 hours.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-08",
    "name": "Botanical Scalp & Hair Nectar",
    "category": "Botanical Skincare",
    "brand": "Sanctuary Botanicals",
    "price": 549,
    "originalPrice": 749,
    "rating": 4.8,
    "reviewsCount": 63,
    "stock": 17,
    "availability": "In Stock",
    "productType": "Hair Oil",
    "quantity": "50 ml",
    "collection": "Skin Sanctuary",
    "badge": "ORGANIC",
    "image": "assets/exotic-hair-serum.webp",
    "description": "Potent botanical infusion of rosemary essential oil, bhringraj herb, and cold-pressed castor oil designed to stimulate dormant hair follicles and soothe the scalp.",
    "ingredients": "Cold-Pressed Castor Oil, Bhringraj Herb Extract, Rosemary Leaf Oil, Cedarwood, Golden Jojoba.",
    "usage": "Section hair and apply 5-10 drops directly to scalp. Massage gently in circular motions 2-3 times weekly.",
    "benefits": "Stimulates scalp microcirculation, reduces follicle thinning, adds brilliant healthy shine.",
    "storage": "Store away from direct light.",
    "shipping": "Standard delivery 2-3 business days.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-09",
    "name": "Organic Dried Herbal Infusion Jars",
    "category": "Organic Teas",
    "brand": "Apothecary Sanctuary",
    "price": 429,
    "originalPrice": 599,
    "rating": 4.9,
    "reviewsCount": 52,
    "stock": 26,
    "availability": "In Stock",
    "productType": "Loose Leaf",
    "quantity": "120g Jar",
    "collection": "Everyday Wellness",
    "badge": "HAND HARVESTED",
    "image": "assets/product-herbal-jars.webp",
    "description": "Curated apothecary jar of hand-dried whole chamomile heads, organic rosehips, and lemon balm leaves grown in our sustainable solar greenhouse.",
    "ingredients": "Whole Organic Chamomile Flowers, Sun-Dried Rosehip Shells, Lemon Balm Leaves, Star Anise.",
    "usage": "Brew 1 tablespoon per mug in boiling water for 6-8 minutes. Strain and sweeten with raw honey.",
    "benefits": "Gentle nerve relaxation, aids evening digestion, comforting floral bouquet.",
    "storage": "Airtight amber jar.",
    "shipping": "Express shipping available.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-10",
    "name": "Apothecary Amber Flask Extract",
    "category": "Elixirs & Tonics",
    "brand": "Apothecary Sanctuary",
    "price": 849,
    "originalPrice": 1150,
    "rating": 5,
    "reviewsCount": 41,
    "stock": 14,
    "availability": "In Stock",
    "productType": "Elixir",
    "quantity": "120 ml Flask",
    "collection": "Artisan Apothecary",
    "badge": "ARTISAN BATCH",
    "image": "assets/product-amber-extract.webp",
    "description": "Limited-edition artisan apothecary compounding featuring wild forest chaga, fermented elderflower, and medicinal bark aged in dark amber apothecary glass.",
    "ingredients": "Aged Wild Chaga Mushroom Extract, Wildcrafted Elderflower, Slippery Elm Bark, Raw Clover Honey.",
    "usage": "Take 10ml straight or stirred into hot tonic water.",
    "benefits": "Potent immune modulation, gut-lining soothing, rich antioxidant profile.",
    "storage": "Cool dark shelf.",
    "shipping": "Priority packaging.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-11",
    "name": "Lymphatic Linen Restorative Drops",
    "category": "Botanical Skincare",
    "brand": "Sanctuary Botanicals",
    "price": 599,
    "originalPrice": 799,
    "rating": 4.9,
    "reviewsCount": 88,
    "stock": 20,
    "availability": "In Stock",
    "productType": "Face Oil",
    "quantity": "45 ml",
    "collection": "Skin Sanctuary",
    "badge": "BESTSELLER",
    "image": "assets/product-lymphatic-drops.webp",
    "description": "Therapeutic botanical oil blend for facial massage and gua sha, combining cypress, frankincense, and sweet almond oil to drain lymphatic fluid and sculpt contours.",
    "ingredients": "Sweet Almond Oil, Italian Cypress Essential Oil, Frankincense Resin, Juniper Berry, Vitamin E.",
    "usage": "Apply 4-5 drops to clean skin before using a gua sha stone or facial massage roller.",
    "benefits": "Reduces facial puffiness, boosts micro-circulation, smooths skin texture.",
    "storage": "Store upright at room temperature.",
    "shipping": "Standard delivery.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-12",
    "name": "Ceremonial Chamomile Calm Tea",
    "category": "Organic Teas",
    "brand": "Apothecary Sanctuary",
    "price": 389,
    "originalPrice": 520,
    "rating": 4.8,
    "reviewsCount": 73,
    "stock": 30,
    "availability": "In Stock",
    "productType": "Loose Leaf",
    "quantity": "100g",
    "collection": "Everyday Wellness",
    "badge": "HERBAL CLASSIC",
    "image": "assets/product-ceremonial-tea.webp",
    "description": "Premium single-origin Egyptian chamomile flowers offering sweet apple-like aromatics and soothing apigenin flavonoids to calm mind and gut.",
    "ingredients": "100% Pure Organic Whole Egyptian Chamomile Blossom Flowers (Matricaria recutita).",
    "usage": "Steep 1 tablespoon in 250ml water just off the boil for 7 minutes.",
    "benefits": "Naturally relieves evening restlessness, soothing stomach comfort, completely caffeine-free.",
    "storage": "Keep tightly closed in dry location.",
    "shipping": "Express dispatch.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-13",
    "name": "Vitamin C 500mg Zinc Complex",
    "category": "Vitamins & Minerals",
    "brand": "Aura BioCare",
    "price": 499,
    "originalPrice": 699,
    "rating": 4.9,
    "reviewsCount": 145,
    "stock": 28,
    "availability": "In Stock",
    "productType": "Tablets",
    "quantity": "60 Tablets",
    "collection": "Immunity & Vitality",
    "badge": "HIGH POTENCY",
    "image": "assets/product-vitamin-c.webp",
    "description": "Clinically buffered non-acidic Vitamin C combined with highly bioavailable zinc bisglycinate and citrus bioflavonoids for superior absorption.",
    "ingredients": "Calcium Ascorbate (Buffered Vitamin C) 500mg, Zinc Bisglycinate 15mg, Citrus Bioflavonoid Complex 50mg.",
    "usage": "Take 1 tablet daily with a meal.",
    "benefits": "Supports radiant collagen synthesis, white blood cell activity, and rapid immune recovery.",
    "storage": "Store in dry place below 25°C.",
    "shipping": "Dispatched in 24 hours.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-14",
    "name": "Omega-3 Wild Deep-Sea Oil 1000mg",
    "category": "Vitamins & Minerals",
    "brand": "Nordic Purity",
    "price": 899,
    "originalPrice": 1199,
    "rating": 5,
    "reviewsCount": 162,
    "stock": 16,
    "availability": "In Stock",
    "productType": "Capsules",
    "quantity": "60 Softgels",
    "collection": "Immunity & Vitality",
    "badge": "PURIFIED",
    "image": "assets/product-omega3.webp",
    "description": "Triple-molecular distilled deep-sea fish oil delivering 600mg EPA and 400mg DHA per serving. Independently tested for zero heavy metals and PCBs.",
    "ingredients": "Purified Wild Anchovy & Sardine Oil, Bovine Gelatin Softgel, Glycerin, Natural Lemon Oil, Vitamin E.",
    "usage": "Take 2 softgels daily with water during your largest meal.",
    "benefits": "Supports optimal heart rhythm, joint lubrication, cognitive focus, and retinal health.",
    "storage": "Keep cool and refrigerated after opening.",
    "shipping": "Cold-chain tracked delivery.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-15",
    "name": "Multivitamin Botanical Synergy",
    "category": "Vitamins & Minerals",
    "brand": "Aura BioCare",
    "price": 649,
    "originalPrice": 899,
    "rating": 4.8,
    "reviewsCount": 98,
    "stock": 25,
    "availability": "In Stock",
    "productType": "Capsules",
    "quantity": "60 Veggie Caps",
    "collection": "Everyday Wellness",
    "badge": "DAILY ESSENTIAL",
    "image": "assets/product-multivitamin.webp",
    "description": "Complete daily whole-food fermented multivitamin containing 24 essential vitamins and minerals combined with organic botanical superfoods.",
    "ingredients": "Vitamins A, C, D3, E, K2, Full B-Complex, Methylfolate, Organic Moringa, Spirulina, Kelp.",
    "usage": "Take 2 vegetarian capsules once daily with breakfast or lunch.",
    "benefits": "Fills nutritional gaps, boosts sustained metabolic energy, supports cellular longevity.",
    "storage": "Store in dry pantry.",
    "shipping": "Standard delivery.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-16",
    "name": "Bio-Active Forest Herbal Balm",
    "category": "Herbal Tinctures",
    "brand": "Apothecary Sanctuary",
    "price": 379,
    "originalPrice": 499,
    "rating": 4.9,
    "reviewsCount": 65,
    "stock": 22,
    "availability": "In Stock",
    "productType": "Balm",
    "quantity": "50g Amber Jar",
    "collection": "Everyday Wellness",
    "badge": "ORGANIC SALVE",
    "image": "assets/product-forest-balm.webp",
    "description": "Warming handcrafted herbal salve infused with arnica montana, wild wintergreen, camphor, and organic beeswax for sore muscles and tense joints.",
    "ingredients": "Organic Olive Oil infused with Arnica Montana, Pure Beeswax, Wintergreen Leaf Oil, Camphor, Eucalyptus Oil.",
    "usage": "Massage a small coin-sized quantity into tense muscles, joints, or temples as needed.",
    "benefits": "Fast warming relief, soothing botanical fragrance, 100% natural wax base.",
    "storage": "Store below 30°C.",
    "shipping": "Dispatched in 24 hours.",
    "returns": "30-day guarantee."
  },
  {
    "id": "apoth-17",
    "name": "Clinical Infrared Sanctuary Thermometer",
    "category": "Medical Equipment",
    "brand": "Apothecary Clinical",
    "price": 1899,
    "originalPrice": 2499,
    "rating": 4.9,
    "reviewsCount": 44,
    "stock": 11,
    "availability": "In Stock",
    "productType": "Device",
    "quantity": "1 Diagnostic Unit",
    "collection": "Clinical Diagnostics",
    "badge": "CLINICAL GRADE",
    "image": "assets/product-thermometer.webp",
    "description": "Non-contact medical-grade infrared clinical forehead thermometer providing 1-second accurate temperature readouts with color-coded fever alarm.",
    "ingredients": "Medical ABS Polymer housing, German High-Precision Infrared Sensor, Backlit HD LCD display.",
    "usage": "Hold 1-3 cm from center of forehead and press scan trigger. Beeps upon reading completion.",
    "benefits": "1-second touchless reading, 35-reading memory log, silent mode for sleeping children.",
    "storage": "Keep in protective clinical case.",
    "shipping": "Priority express dispatch with calibration certificate.",
    "returns": "1-year warranty & 30-day returns."
  },
  {
    "id": "apoth-18",
    "name": "Precision Pulse Oximeter & SpO2 Monitor",
    "category": "Medical Equipment",
    "brand": "Apothecary Clinical",
    "price": 999,
    "originalPrice": 1499,
    "rating": 5,
    "reviewsCount": 89,
    "stock": 14,
    "availability": "In Stock",
    "productType": "Device",
    "quantity": "1 Diagnostic Unit",
    "collection": "Clinical Diagnostics",
    "badge": "BESTSELLER",
    "image": "assets/product-oximeter.webp",
    "description": "Hospital-accurate fingertip pulse oximeter with multi-directional dual-color OLED display tracking blood oxygen saturation (SpO2) and pulse rate graph.",
    "ingredients": "Medical grade silicone finger chamber, Dual-wavelength optical sensor, High-contrast OLED Screen.",
    "usage": "Insert index finger into chamber and press power button. Keep finger still for 5 seconds.",
    "benefits": "Instant blood oxygen saturation tracking, perfusion index indicator, low battery shutoff.",
    "storage": "Store in dry place away from moisture.",
    "shipping": "Dispatched with lanyard and batteries.",
    "returns": "1-year warranty & 30-day returns."
  }
];

const InventoryManager = {
  STORAGE_KEY: "pharmacy_store_inventory",

  init() {
    if (typeof localStorage === 'undefined') return;
    let stored = null;
    try {
      stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    } catch (e) {
      stored = null;
    }
    if (!stored || !Array.isArray(stored) || stored.length < DEFAULT_PRODUCTS.length || stored.some(p => !p.image || p.image.includes('vitamins-01') || p.image.includes('medicine-01'))) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    } else {
      const existingIds = new Set(stored.map(p => p.id));
      let updated = false;
      DEFAULT_PRODUCTS.forEach(dp => {
        const found = stored.find(s => s.id === dp.id);
        if (!found) {
          stored.push(dp);
          updated = true;
        } else if (found.image !== dp.image) {
          found.image = dp.image;
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored));
      }
    }
  },

  getAll() {
    this.init();
    try {
      if (typeof localStorage !== 'undefined') {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || DEFAULT_PRODUCTS;
      }
      return DEFAULT_PRODUCTS;
    } catch (e) {
      console.error("Error reading inventory:", e);
      return DEFAULT_PRODUCTS;
    }
  },

  getById(id) {
    const products = this.getAll();
    const found = products.find(p => p.id === id);
    if (found) return found;
    return DEFAULT_PRODUCTS.find(p => p.id === id) || null;
  },

  save(product) {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    }
    return product;
  },

  delete(id) {
    let products = this.getAll();
    products = products.filter(p => p.id !== id);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
    }
  },

  resetDefaults() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    }
    return DEFAULT_PRODUCTS;
  }
};

InventoryManager.init();
if (typeof window !== 'undefined') {
  window.InventoryManager = InventoryManager;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DEFAULT_PRODUCTS, InventoryManager };
}
