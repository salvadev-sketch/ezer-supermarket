const Product = require("../models/Product");
const { CATEGORIES } = require("../models/Product");
const { destroyAsset, extractPublicIdFromUrl } = require("../config/cloudinary");

// Best-effort Cloudinary cleanup — never lets a destroy failure block the
// request that triggered it (the product change already succeeded/is
// succeeding in Mongo by the time this runs).
async function destroyImageIfAny(imageURL) {
  if (!imageURL) return;
  const publicId = extractPublicIdFromUrl(imageURL);
  if (!publicId) return;
  try {
    await destroyAsset(publicId);
  } catch (err) {
    console.error("Cloudinary cleanup failed:", err);
  }
}

// GET /api/products?category=&search=  (public)
async function list(req, res) {
  const { category, search } = req.query;
  const filter = {};
  if (category && category !== "all") filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };
  const products = await Product.find(filter).sort({ name: 1 });
  res.json({ products, categories: CATEGORIES });
}

// GET /api/products/featured  (public, home page)
// Prefers products explicitly flagged via the dashboard's "Show on
// homepage" checkbox. Falls back to newest products only if nothing
// has been flagged yet, so the section is never empty.
async function featured(req, res) {
  let products = await Product.find({ featured: true }).sort({ createdAt: -1 }).limit(8);
  if (products.length === 0) {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(8);
  }
  res.json(products);
}

// GET /api/products/:id  (public)
async function getOne(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
}

// POST /api/products  (admin)
async function create(req, res) {
  const { name, category, price, stock, minStockLevel, icon, imageURL, description, featured: isFeatured } = req.body;
  if (!name || !category || price == null) {
    return res.status(400).json({ error: "name, category, and price are required" });
  }
  const product = await Product.create({
    name, category, price, stock: stock || 0, minStockLevel: minStockLevel || 10,
    icon, imageURL, description, featured: !!isFeatured,
  });
  res.status(201).json(product);
}

// PUT /api/products/:id  (admin)
async function update(req, res) {
  const existing = await Product.findById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Product not found" });
  const oldImageURL = existing.imageURL;

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  const imageChanged = Object.prototype.hasOwnProperty.call(req.body, "imageURL") && req.body.imageURL !== oldImageURL;
  if (imageChanged) {
    await destroyImageIfAny(oldImageURL);
  }

  res.json(product);
}

// DELETE /api/products/:id  (admin)
async function remove(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  await destroyImageIfAny(product.imageURL);
  res.json({ ok: true });
}

// POST /api/products/seed-samples  (admin)
// One-time helper: inserts 5 starter products per category. Matches by
// name, so products you've already added (or already ran this once)
// are left untouched — safe to click more than once.
const SAMPLE_PRODUCTS = [
  // Fresh Produce
  { name: 'Fresh Tomatoes (1kg)', category: 'Fresh Produce', price: 1200, stock: 50, minStockLevel: 10, icon: '🍅' },
  { name: 'Ripe Bananas (bunch)', category: 'Fresh Produce', price: 1500, stock: 40, minStockLevel: 10, icon: '🍌' },
  { name: 'Fresh Onions (1kg)', category: 'Fresh Produce', price: 900, stock: 45, minStockLevel: 10, icon: '🧅' },
  { name: 'Fresh Carrots (1kg)', category: 'Fresh Produce', price: 1000, stock: 40, minStockLevel: 10, icon: '🥕' },
  { name: 'Fresh Cabbage (1pc)', category: 'Fresh Produce', price: 700, stock: 35, minStockLevel: 8, icon: '🥬' },
  // Bakery
  { name: 'White Sliced Bread', category: 'Bakery', price: 1800, stock: 30, minStockLevel: 8, icon: '🍞' },
  { name: 'Brown Bread (Whole Wheat)', category: 'Bakery', price: 2000, stock: 25, minStockLevel: 8, icon: '🍞' },
  { name: 'Croissants (pack of 4)', category: 'Bakery', price: 2500, stock: 20, minStockLevel: 5, icon: '🥐' },
  { name: 'Doughnuts (pack of 6)', category: 'Bakery', price: 1500, stock: 20, minStockLevel: 5, icon: '🍩' },
  { name: 'Dinner Rolls (pack of 8)', category: 'Bakery', price: 1200, stock: 25, minStockLevel: 8, icon: '🥖' },
  // Dairy & Eggs
  { name: 'Fresh Eggs (tray of 30)', category: 'Dairy & Eggs', price: 4500, stock: 25, minStockLevel: 5, icon: '🥚' },
  { name: 'Full Cream Milk (1L)', category: 'Dairy & Eggs', price: 1600, stock: 35, minStockLevel: 10, icon: '🥛' },
  { name: 'Greek Yogurt (500g)', category: 'Dairy & Eggs', price: 2800, stock: 20, minStockLevel: 5, icon: '🥣' },
  { name: 'Cheddar Cheese (200g)', category: 'Dairy & Eggs', price: 3500, stock: 15, minStockLevel: 5, icon: '🧀' },
  { name: 'Butter (250g)', category: 'Dairy & Eggs', price: 2200, stock: 20, minStockLevel: 5, icon: '🧈' },
  // Beverages
  { name: 'Mineral Water (1.5L)', category: 'Beverages', price: 800, stock: 60, minStockLevel: 15, icon: '💧' },
  { name: 'Coca-Cola (500ml)', category: 'Beverages', price: 700, stock: 50, minStockLevel: 15, icon: '🥤' },
  { name: 'Orange Juice (1L)', category: 'Beverages', price: 2500, stock: 25, minStockLevel: 8, icon: '🧃' },
  { name: 'Instant Coffee (200g)', category: 'Beverages', price: 4500, stock: 20, minStockLevel: 5, icon: '☕' },
  { name: 'Black Tea (100 bags)', category: 'Beverages', price: 3000, stock: 20, minStockLevel: 5, icon: '🍵' },
  // Meat & Fish
  { name: 'Chicken Breast (1kg)', category: 'Meat & Fish', price: 5500, stock: 20, minStockLevel: 5, icon: '🍗' },
  { name: 'Beef (1kg)', category: 'Meat & Fish', price: 7000, stock: 15, minStockLevel: 5, icon: '🥩' },
  { name: 'Tilapia Fish (1kg)', category: 'Meat & Fish', price: 4500, stock: 15, minStockLevel: 5, icon: '🐟' },
  { name: 'Goat Meat (1kg)', category: 'Meat & Fish', price: 8000, stock: 10, minStockLevel: 3, icon: '🍖' },
  { name: 'Sausages (500g)', category: 'Meat & Fish', price: 3500, stock: 20, minStockLevel: 5, icon: '🌭' },
  // Grains & Staples
  { name: 'Rice (5kg bag)', category: 'Grains & Staples', price: 6000, stock: 40, minStockLevel: 8, icon: '🍚' },
  { name: 'Maize Flour (5kg)', category: 'Grains & Staples', price: 4500, stock: 35, minStockLevel: 8, icon: '🌽' },
  { name: 'Dry Beans (2kg)', category: 'Grains & Staples', price: 3000, stock: 30, minStockLevel: 8, icon: '🫘' },
  { name: 'Cassava Flour (2kg)', category: 'Grains & Staples', price: 2500, stock: 25, minStockLevel: 8, icon: '🌾' },
  { name: 'Spaghetti Pasta (500g)', category: 'Grains & Staples', price: 1500, stock: 30, minStockLevel: 8, icon: '🍝' },
  // Snacks & Confectionery
  { name: 'Potato Chips (150g)', category: 'Snacks & Confectionery', price: 1400, stock: 45, minStockLevel: 10, icon: '🥔' },
  { name: 'Chocolate Bar (100g)', category: 'Snacks & Confectionery', price: 1200, stock: 40, minStockLevel: 10, icon: '🍫' },
  { name: 'Biscuits (pack)', category: 'Snacks & Confectionery', price: 1000, stock: 40, minStockLevel: 10, icon: '🍪' },
  { name: 'Popcorn (200g)', category: 'Snacks & Confectionery', price: 900, stock: 30, minStockLevel: 8, icon: '🍿' },
  { name: 'Peanuts Roasted (250g)', category: 'Snacks & Confectionery', price: 1500, stock: 30, minStockLevel: 8, icon: '🥜' },
  // Condiments & Sauces
  { name: 'Tomato Sauce (500ml)', category: 'Condiments & Sauces', price: 1800, stock: 25, minStockLevel: 8, icon: '🍅' },
  { name: 'Cooking Oil (1L)', category: 'Condiments & Sauces', price: 3500, stock: 30, minStockLevel: 8, icon: '🛢️' },
  { name: 'Soy Sauce (250ml)', category: 'Condiments & Sauces', price: 2000, stock: 20, minStockLevel: 5, icon: '🍶' },
  { name: 'Mayonnaise (400g)', category: 'Condiments & Sauces', price: 2800, stock: 20, minStockLevel: 5, icon: '🥫' },
  { name: 'Chili Sauce (250ml)', category: 'Condiments & Sauces', price: 1600, stock: 20, minStockLevel: 5, icon: '🌶️' },
  // Personal Care
  { name: 'Bar Soap (100g)', category: 'Personal Care', price: 800, stock: 50, minStockLevel: 15, icon: '🧼' },
  { name: 'Toothpaste (100ml)', category: 'Personal Care', price: 1500, stock: 35, minStockLevel: 10, icon: '🪥' },
  { name: 'Shampoo (400ml)', category: 'Personal Care', price: 3500, stock: 25, minStockLevel: 8, icon: '🧴' },
  { name: 'Body Lotion (400ml)', category: 'Personal Care', price: 3000, stock: 25, minStockLevel: 8, icon: '🧴' },
  { name: 'Deodorant Spray', category: 'Personal Care', price: 2500, stock: 25, minStockLevel: 8, icon: '🧴' },
  // Household & Cleaning
  { name: 'Dish Washing Liquid (500ml)', category: 'Household & Cleaning', price: 2200, stock: 30, minStockLevel: 8, icon: '🧴' },
  { name: 'Laundry Detergent (1kg)', category: 'Household & Cleaning', price: 3500, stock: 25, minStockLevel: 8, icon: '🧺' },
  { name: 'Toilet Paper (pack of 4)', category: 'Household & Cleaning', price: 1800, stock: 40, minStockLevel: 10, icon: '🧻' },
  { name: 'Bleach (750ml)', category: 'Household & Cleaning', price: 1500, stock: 20, minStockLevel: 5, icon: '🧴' },
  { name: 'All-Purpose Cleaner (500ml)', category: 'Household & Cleaning', price: 2000, stock: 25, minStockLevel: 8, icon: '🧽' },
  // Health & Baby
  { name: 'Baby Diapers (pack of 30)', category: 'Health & Baby', price: 8500, stock: 20, minStockLevel: 5, icon: '👶' },
  { name: 'Baby Wipes (80pcs)', category: 'Health & Baby', price: 2500, stock: 25, minStockLevel: 8, icon: '🧻' },
  { name: 'Baby Formula (400g)', category: 'Health & Baby', price: 12000, stock: 10, minStockLevel: 3, icon: '🍼' },
  { name: 'Paracetamol Tablets (20pcs)', category: 'Health & Baby', price: 1000, stock: 30, minStockLevel: 8, icon: '💊' },
  { name: 'Hand Sanitizer (100ml)', category: 'Health & Baby', price: 1500, stock: 30, minStockLevel: 8, icon: '🧴' },
];

async function seedSamples(req, res) {
  let inserted = 0;
  for (const p of SAMPLE_PRODUCTS) {
    const result = await Product.updateOne(
      { name: p.name },
      { $setOnInsert: { ...p, imageURL: '', description: '', featured: false } },
      { upsert: true }
    );
    if (result.upsertedCount > 0) inserted += 1;
  }
  res.json({ inserted, skipped: SAMPLE_PRODUCTS.length - inserted, total: SAMPLE_PRODUCTS.length });
}

module.exports = { list, featured, getOne, create, update, remove, seedSamples };
