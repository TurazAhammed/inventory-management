import { Platform } from 'react-native';

// Runtime API URL selection:
// - If `NEXT_PUBLIC_API_URL` is provided (via your env/build), use it.
// - Otherwise pick a sensible default per platform:
//   iOS simulator -> localhost, Android emulator -> 10.0.2.2, fallback -> localhost
const envUrl = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL
  ? String(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, '')
  : '';

const DEFAULT_HOST = Platform.select({
  android: 'http://192.168.0.100:3000',
  default: 'http://localhost:3000',
});

export const API_URL = envUrl || DEFAULT_HOST;


export interface Inventory {
  id?: number;
  name?: string;
  buy_price?: number;
  sell_price?: number;
  quantity?: number;
  created_at?: string;
  is_active?: number | boolean;
}

export async function getInventoryList(): Promise<Inventory[]> {
  const res = await fetch(`${API_URL}/api/inventory`);
  if (!res.ok) throw new Error('Failed to fetch Inventory from API');
  const data: Inventory[] = await res.json();
  return data;
}

export interface Sale {
  id?: number;
  item_id: number;
  quantity_sold: number;
  sell_price: number;
  total_sell?: number;
  sold_at?: string;
}

export async function getSalesList(): Promise<Sale[]> {
  const res = await fetch(`${API_URL}/api/sales`);
  if (!res.ok) throw new Error('Failed to fetch sales from API');
  const data: Sale[] = await res.json();
  return data;
}

export async function addInventoryItem(item: Inventory): Promise<Inventory> {
  const res = await fetch(`${API_URL}/api/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to add inventory item');
  const data: Inventory = await res.json();
  return data;
}

export async function updateInventoryItem(id: number, item: Inventory): Promise<Inventory> {
  const res = await fetch(`${API_URL}/api/inventory/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to update inventory item');
  const data: Inventory = await res.json();
  return data;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/inventory/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete inventory item');
}

export async function addSale(sale: Sale): Promise<Sale> {
  const res = await fetch(`${API_URL}/api/sales`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sale),
  });
  if (!res.ok) throw new Error('Failed to add sale');
  const data: Sale = await res.json();
  return data;
}

export interface SummaryData {
  inventory_added: {
    count: number;
    total_qty: number;
    total_buy_price?: number;
  };
  sales: {
    count: number;
    total_qty: number;
    total_revenue: number;
    total_buy_cost?: number;
  };
  profit?: number;
}

export async function getDailySummary(): Promise<SummaryData> {
  const res = await fetch(`${API_URL}/api/summary/daily`);
  if (!res.ok) throw new Error('Failed to fetch daily summary');
  const data: SummaryData = await res.json();
  return data;
}

export async function getWeeklySummary(): Promise<SummaryData> {
  const res = await fetch(`${API_URL}/api/summary/weekly`);
  if (!res.ok) throw new Error('Failed to fetch weekly summary');
  const data: SummaryData = await res.json();
  return data;
}

export async function getMonthlySummary(): Promise<SummaryData> {
  const res = await fetch(`${API_URL}/api/summary/monthly`);
  if (!res.ok) throw new Error('Failed to fetch monthly summary');
  const data: SummaryData = await res.json();
  return data;
}

export async function getYearlySummary(): Promise<SummaryData> {
  const res = await fetch(`${API_URL}/api/summary/yearly`);
  if (!res.ok) throw new Error('Failed to fetch yearly summary');
  const data: SummaryData = await res.json();
  return data;
}

// No default export — this is a helper module.
