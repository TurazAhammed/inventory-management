const express = require('express');
const pool = require('../db');
const router = express.Router();
const auth = require("../middleware/auth");
const role = require("../middleware/role");

// List inventory with full fields including is_active
router.get('/',auth,role(["inventory_admin", "super_admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, buy_price, sell_price, quantity,transport_cost,labor_cost, created_at, is_active FROM inventory ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// List inventory with full fields including is_active
router.get('/product-name',auth,role(["inventory_admin", "super_admin"]), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, quantity FROM inventory WHERE quantity > 0 ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add an item: { name, buy_price, sell_price, quantity, is_active(optional) }
router.post('/',auth,role(["inventory_admin", "super_admin"]), async (req, res) => {
  const { name, buy_price, sell_price, transport_cost, labor_cost, quantity, is_active } = req.body;
  if (!name || !quantity) return res.status(400).json({ status: 'error', message: 'Missing fields' });
  try {
    const activeFlag = typeof is_active === 'boolean' ? (is_active ? 1 : 0) : 1;
    const result = await pool.query(
      'INSERT INTO inventory (name, buy_price,transport_cost,labor_cost, sell_price, quantity, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      [name, buy_price || 0, transport_cost || 0, labor_cost || 0, sell_price || 0, quantity, activeFlag]
    );
    if(result[0].insertId) {
      res.status(201).json({
        status: 'success',
        message: 'Item added successfully'
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Failed to add item'
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// Soft-delete an item by id (set is_active = 0)
router.delete('/:id',auth,role(["inventory_admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('UPDATE inventory SET is_active = 0 WHERE id = ? AND is_active = 1', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or already inactive' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Update an item by id
router.put('/:id',auth,role(["inventory_admin", "super_admin"]), async (req, res) => {
  const { id } = req.params;
  const { name, buy_price,transport_cost,labor_cost, sell_price, quantity, is_active } = req.body;
  if (!name && buy_price == null && transport_cost == null && labor_cost == null && sell_price == null && quantity == null && is_active == null) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  try {
    // Build dynamic SET clause
    const fields = [];
    const values = [];
    if (name != null) { fields.push('name = ?'); values.push(name); }
    if (buy_price != null) { fields.push('buy_price = ?'); values.push(buy_price); }
    if (transport_cost != null) { fields.push('transport_cost = ?'); values.push(transport_cost); }
    if (labor_cost != null) { fields.push('labor_cost = ?'); values.push(labor_cost); }
    if (sell_price != null) { fields.push('sell_price = ?'); values.push(sell_price); }
    if (quantity != null) { fields.push('quantity = ?'); values.push(quantity); }
    if (is_active != null) { fields.push('is_active = ?'); values.push(is_active ? 1 : 0); }

    const sql = `UPDATE inventory SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(sql, values);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' });

    const [rows] = await pool.query('SELECT id, name, buy_price,transport_cost,labor_cost, sell_price, quantity, created_at, is_active FROM inventory WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

module.exports = router;



