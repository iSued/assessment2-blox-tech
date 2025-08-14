const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
function readData() {
  const raw = fs.readFileSync(DATA_PATH);
  return JSON.parse(raw);
}

// Async reader used only by the GET /api/items route to avoid blocking the event loop
async function readDataAsync() {
  const raw = await fs.promises.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readDataAsync();
    const { limit, q, page } = req.query;
    let results = data || [];

    if (q) {
      const qLower = String(q).toLowerCase();
      results = results.filter(item => (item.name || '').toLowerCase().includes(qLower));
    }

    const total = results.length;
    // limit corresponds to items per page; default to 10
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    // compute total pages based on limitNum
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    // page number clamped to [1, totalPages]
    let pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    pageNum = Math.min(pageNum, totalPages);

    const start = (pageNum - 1) * limitNum;
    const paged = results.slice(start, start + limitNum);

    res.json({ items: paged, total, page: pageNum, totalPages, perPage: limitNum });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', (req, res, next) => {
  try {
    const data = readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = readData();
    item.id = Date.now();
    data.push(item);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;