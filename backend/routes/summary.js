const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get daily summary
router.get('/daily', async (req, res) => {
	try {
		// Daily inventory additions (include total buy price for added stock)
		const [inventoryDaily] = await pool.query(
			`SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM((COALESCE(buy_price,0) + COALESCE(transport_cost,0) + COALESCE(labor_cost,0)) * quantity), 0) as total_buy_price
			 FROM inventory 
			 WHERE DATE(created_at) = CURDATE()`
		);

		// Daily sales (include buy-cost for sold items by joining inventory)
		const [salesDaily] = await pool.query(
			`SELECT COUNT(*) as count,
							COALESCE(SUM(s.quantity_sold), 0) as total_qty,
							COALESCE(SUM(s.total_sell), 0) as total_revenue,
							COALESCE(SUM(s.quantity_sold * (COALESCE(i.buy_price,0) + COALESCE(i.transport_cost,0)) + COALESCE(s.labor_cost,0)), 0) as total_buy_cost
			 FROM sales s
			 LEFT JOIN inventory i ON s.item_id = i.id
			 WHERE DATE(s.sold_at) = CURDATE()`
		);

		const inventoryData = inventoryDaily[0] || { count: 0, total_qty: 0, total_buy_price: 0 };
		const salesData = salesDaily[0] || { count: 0, total_qty: 0, total_revenue: 0, total_buy_cost: 0 };

		const inventory_total_buy = Number(inventoryData.total_buy_price) || 0;
		const sales_total_revenue = Number(salesData.total_revenue) || 0;
		const sales_total_buy_cost = Number(salesData.total_buy_cost) || 0;

		res.json({
			inventory_added: {
				count: Number(inventoryData.count) || 0,
				total_qty: Number(inventoryData.total_qty) || 0,
				total_buy_price: inventory_total_buy
			},
			sales: {
				count: Number(salesData.count) || 0,
				total_qty: Number(salesData.total_qty) || 0,
				total_revenue: sales_total_revenue,
				total_buy_cost: sales_total_buy_cost
			},
			profit: Number((sales_total_revenue - sales_total_buy_cost).toFixed(2))
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Database error' });
	}
});

// Get weekly summary
router.get('/weekly', async (req, res) => {
	try {
		// Weekly inventory additions (include total buy price)
		const [inventoryWeekly] = await pool.query(
			`SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM((COALESCE(buy_price,0) + COALESCE(transport_cost,0) + COALESCE(labor_cost,0)) * quantity), 0) as total_buy_price
			 FROM inventory 
			 WHERE YEARWEEK(created_at) = YEARWEEK(CURDATE())`
		);

		// Weekly sales (include buy-cost for sold items)
		const [salesWeekly] = await pool.query(
			`SELECT COUNT(*) as count,
							COALESCE(SUM(s.quantity_sold), 0) as total_qty,
							COALESCE(SUM(s.total_sell), 0) as total_revenue,
							COALESCE(SUM(s.quantity_sold * (COALESCE(i.buy_price,0) + COALESCE(i.transport_cost,0)) + COALESCE(s.labor_cost,0)), 0) as total_buy_cost
			 FROM sales s
			 LEFT JOIN inventory i ON s.item_id = i.id
			 WHERE YEARWEEK(s.sold_at) = YEARWEEK(CURDATE())`
		);

		const inventoryData = inventoryWeekly[0] || { count: 0, total_qty: 0, total_buy_price: 0 };
		const salesData = salesWeekly[0] || { count: 0, total_qty: 0, total_revenue: 0, total_buy_cost: 0 };

		const inventory_total_buy = Number(inventoryData.total_buy_price) || 0;
		const sales_total_revenue = Number(salesData.total_revenue) || 0;
		const sales_total_buy_cost = Number(salesData.total_buy_cost) || 0;

		res.json({
			inventory_added: {
				count: Number(inventoryData.count) || 0,
				total_qty: Number(inventoryData.total_qty) || 0,
				total_buy_price: inventory_total_buy
			},
			sales: {
				count: Number(salesData.count) || 0,
				total_qty: Number(salesData.total_qty) || 0,
				total_revenue: sales_total_revenue,
				total_buy_cost: sales_total_buy_cost
			},
			profit: Number((sales_total_revenue - sales_total_buy_cost).toFixed(2))
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Database error' });
	}
});

// Get monthly summary
router.get('/monthly', async (req, res) => {
	try {
		const [inventoryMonthly] = await pool.query(
			`SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM((COALESCE(buy_price,0) + COALESCE(transport_cost,0) + COALESCE(labor_cost,0)) * quantity), 0) as total_buy_price
			 FROM inventory
			 WHERE YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())`
		);

		const [salesMonthly] = await pool.query(
			`SELECT COUNT(*) as count,
							COALESCE(SUM(s.quantity_sold), 0) as total_qty,
							COALESCE(SUM(s.total_sell), 0) as total_revenue,
							COALESCE(SUM(s.quantity_sold * (COALESCE(i.buy_price,0) + COALESCE(i.transport_cost,0)) + COALESCE(s.labor_cost,0)), 0) as total_buy_cost
			 FROM sales s
			 LEFT JOIN inventory i ON s.item_id = i.id
			 WHERE YEAR(s.sold_at) = YEAR(CURDATE()) AND MONTH(s.sold_at) = MONTH(CURDATE())`
		);

		const inventoryData = inventoryMonthly[0] || { count: 0, total_qty: 0, total_buy_price: 0 };
		const salesData = salesMonthly[0] || { count: 0, total_qty: 0, total_revenue: 0, total_buy_cost: 0 };

		const inventory_total_buy = Number(inventoryData.total_buy_price) || 0;
		const sales_total_revenue = Number(salesData.total_revenue) || 0;
		const sales_total_buy_cost = Number(salesData.total_buy_cost) || 0;

		res.json({
			inventory_added: {
				count: Number(inventoryData.count) || 0,
				total_qty: Number(inventoryData.total_qty) || 0,
				total_buy_price: inventory_total_buy
			},
			sales: {
				count: Number(salesData.count) || 0,
				total_qty: Number(salesData.total_qty) || 0,
				total_revenue: sales_total_revenue,
				total_buy_cost: sales_total_buy_cost
			},
			profit: Number((sales_total_revenue - sales_total_buy_cost).toFixed(2))
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Database error' });
	}
});

// Get yearly summary
router.get('/yearly', async (req, res) => {
	try {
		const [inventoryYearly] = await pool.query(
			`SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_qty, COALESCE(SUM((COALESCE(buy_price,0) + COALESCE(transport_cost,0) + COALESCE(labor_cost,0)) * quantity), 0) as total_buy_price
			 FROM inventory
			 WHERE YEAR(created_at) = YEAR(CURDATE())`
		);

		const [salesYearly] = await pool.query(
			`SELECT COUNT(*) as count,
							COALESCE(SUM(s.quantity_sold), 0) as total_qty,
							COALESCE(SUM(s.total_sell), 0) as total_revenue,
							COALESCE(SUM(s.quantity_sold * (COALESCE(i.buy_price,0) + COALESCE(i.transport_cost,0)) + COALESCE(s.labor_cost,0)), 0) as total_buy_cost
			 FROM sales s
			 LEFT JOIN inventory i ON s.item_id = i.id
			 WHERE YEAR(s.sold_at) = YEAR(CURDATE())`
		);

		const inventoryData = inventoryYearly[0] || { count: 0, total_qty: 0, total_buy_price: 0 };
		const salesData = salesYearly[0] || { count: 0, total_qty: 0, total_revenue: 0, total_buy_cost: 0 };

		const inventory_total_buy = Number(inventoryData.total_buy_price) || 0;
		const sales_total_revenue = Number(salesData.total_revenue) || 0;
		const sales_total_buy_cost = Number(salesData.total_buy_cost) || 0;

		res.json({
			inventory_added: {
				count: Number(inventoryData.count) || 0,
				total_qty: Number(inventoryData.total_qty) || 0,
				total_buy_price: inventory_total_buy
			},
			sales: {
				count: Number(salesData.count) || 0,
				total_qty: Number(salesData.total_qty) || 0,
				total_revenue: sales_total_revenue,
				total_buy_cost: sales_total_buy_cost
			},
			profit: Number((sales_total_revenue - sales_total_buy_cost).toFixed(2))
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: 'Database error' });
	}
});

module.exports = router;
