const express = require('express');
const pool = require('../db');
const router = express.Router();




// Get all sales (single-item sales)
router.get('/', async (req, res) => {
	try {
		const [rows] = await pool.query(
			'SELECT id, item_id, quantity_sold, sell_price, total_sell, sold_at FROM sales ORDER BY id DESC'
		);
		res.json(rows);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Database error' });
	}
});

// Create a single-item sale: { item_id, quantity_sold, sell_price }
router.post('/', async (req, res) => {
	const { item_id, quantity_sold, sell_price } = req.body;
	if (!item_id || !quantity_sold || !sell_price) return res.status(400).json({ error: 'Missing fields' });

	const total_sell = Number(quantity_sold) * Number(sell_price);
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		// ensure enough stock and decrement
		const [updateRes] = await conn.query(
			'UPDATE inventory SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
			[quantity_sold, item_id, quantity_sold]
		);
		if (updateRes.affectedRows === 0) throw new Error('Insufficient stock or item not found');

		const [result] = await conn.query(
			'INSERT INTO sales (item_id, quantity_sold, sell_price, total_sell, sold_at) VALUES (?, ?, ?, ?, NOW())',
			[item_id, quantity_sold, sell_price, total_sell]
		);

		await conn.commit();
		res.status(201).json({ id: result.insertId, item_id, quantity_sold, sell_price, total_sell });
	} catch (err) {
		await conn.rollback();
		console.error(err);
		res.status(400).json({ error: err.message || 'Sale failed' });
	} finally {
		conn.release();
	}
});

// Update a sale: adjust inventory accordingly if quantity/item changes
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { item_id: new_item_id, quantity_sold: new_qty, sell_price: new_price } = req.body;

	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();

		// fetch existing sale
		const [rows] = await conn.query('SELECT id, item_id, quantity_sold, sell_price FROM sales WHERE id = ?', [id]);
		if (!rows || rows.length === 0) {
			await conn.rollback();
			return res.status(404).json({ error: 'Sale not found' });
		}
		const existing = rows[0];
		const old_item_id = existing.item_id;
		const old_qty = Number(existing.quantity_sold || 0);

		const target_item = new_item_id != null ? Number(new_item_id) : old_item_id;
		const target_qty = new_qty != null ? Number(new_qty) : old_qty;
		const target_price = new_price != null ? Number(new_price) : Number(existing.sell_price || 0);

		// If item changed, return old qty to old item and decrement new item
		if (target_item !== old_item_id) {
			// return old qty to old item
			await conn.query('UPDATE inventory SET quantity = quantity + ? WHERE id = ?', [old_qty, old_item_id]);

			// attempt to decrement new item by target_qty
			const [upd] = await conn.query('UPDATE inventory SET quantity = quantity - ? WHERE id = ? AND quantity >= ?', [target_qty, target_item, target_qty]);
			if (upd.affectedRows === 0) throw new Error('Insufficient stock for new item');
		} else {
			// same item: compute delta
			const delta = target_qty - old_qty;
			if (delta > 0) {
				// need to consume more stock
				const [upd] = await conn.query('UPDATE inventory SET quantity = quantity - ? WHERE id = ? AND quantity >= ?', [delta, target_item, delta]);
				if (upd.affectedRows === 0) throw new Error('Insufficient stock to increase sold quantity');
			} else if (delta < 0) {
				// return stock
				await conn.query('UPDATE inventory SET quantity = quantity + ? WHERE id = ?', [Math.abs(delta), target_item]);
			}
		}

		const total_sell = target_qty * target_price;
		const fields = [];
		const values = [];
		if (new_item_id != null) { fields.push('item_id = ?'); values.push(target_item); }
		if (new_qty != null) { fields.push('quantity_sold = ?'); values.push(target_qty); }
		if (new_price != null) { fields.push('sell_price = ?'); values.push(target_price); }
		if (fields.length > 0) {
			fields.push('total_sell = ?'); values.push(total_sell);
			values.push(id);
			const sql = `UPDATE sales SET ${fields.join(', ')} WHERE id = ?`;
			await conn.query(sql, values);
		}

		const [updatedRows] = await conn.query('SELECT id, item_id, quantity_sold, sell_price, total_sell, sold_at FROM sales WHERE id = ?', [id]);
		await conn.commit();
		res.json(updatedRows[0]);
	} catch (err) {
		await conn.rollback();
		console.error(err);
		res.status(400).json({ error: err.message || 'Update failed' });
	} finally {
		conn.release();
	}
});

// Delete a sale and restore inventory quantity
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const conn = await pool.getConnection();
	try {
		await conn.beginTransaction();
		const [rows] = await conn.query('SELECT id, item_id, quantity_sold FROM sales WHERE id = ?', [id]);
		if (!rows || rows.length === 0) {
			await conn.rollback();
			return res.status(404).json({ error: 'Sale not found' });
		}
		const sale = rows[0];
		const itemId = sale.item_id;
		const qty = Number(sale.quantity_sold || 0);

		// restore inventory
		await conn.query('UPDATE inventory SET quantity = quantity + ? WHERE id = ?', [qty, itemId]);

		// delete sale
		const [del] = await conn.query('DELETE FROM sales WHERE id = ?', [id]);
		if (del.affectedRows === 0) {
			await conn.rollback();
			return res.status(500).json({ error: 'Failed to delete sale' });
		}

		await conn.commit();
		res.json({ success: true });
	} catch (err) {
		await conn.rollback();
		console.error(err);
		res.status(500).json({ error: err.message || 'Delete failed' });
	} finally {
		conn.release();
	}
});

module.exports = router;

