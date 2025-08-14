const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

async function readDataAsync() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const items = await readDataAsync();
    const list = Array.isArray(items) ? items : [];

    const total = list.length;
    const sum = list.reduce((s, it) => s + (Number(it && it.price) || 0), 0);
    const averagePrice = total ? Number((sum / total).toFixed(2)) : 0;

    const catMap = new Map();
    for (const it of list) {
      const category = it && it.category ? it.category : 'Uncategorized';
      const price = Number(it && it.price) || 0;
      const cur = catMap.get(category) || { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += price;
      catMap.set(category, cur);
    }

    const categories = Array.from(catMap.entries()).map(([category, { count, sum }]) => ({
      category,
      count,
      averagePrice: count ? Number((sum / count).toFixed(2)) : 0,
    }));

    res.json({ total, averagePrice, categories });
  } catch (err) {
    next(err);
  }
});

module.exports = router;