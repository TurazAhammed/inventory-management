import { Platform } from 'react-native';
import axios from 'axios';

// Runtime API URL selection:
// - If `NEXT_PUBLIC_API_URL` is provided (via your env/build), use it.
// - Otherwise pick a sensible default per platform:
//   iOS simulator -> localhost, Android emulator -> 10.0.2.2, fallback -> localhost
const envUrl = typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL
  ? String(process.env.NEXT_PUBLIC_API_URL).replace(/\/$/, '')
  : '';

const DEFAULT_HOST = Platform.select({
  android: 'http://192.168.0.104:3000',
  default: 'http://localhost:3000',
});

export const API_URL = envUrl || DEFAULT_HOST;

// Configure axios instance for API calls
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  config => {
    const token = axios.defaults.headers.common['Authorization'];
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  error => Promise.reject(error)
);


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
  const res = await apiClient.get<Inventory[]>('/api/inventory');
  return res.data;
}

export interface Sale {
  id?: number;
  item_id: number;
  item_name?: string;
  quantity_sold: number;
  sell_price: number;
  total_sell?: number;
  sold_at?: string;
}

export async function getSalesList(): Promise<Sale[]> {
  const res = await apiClient.get<Sale[]>('/api/sales');
  return res.data;
}

export async function addInventoryItem(item: Inventory): Promise<Inventory> {
  const res = await apiClient.post<Inventory>('/api/inventory', item);
  return res.data;
}

export async function updateInventoryItem(id: number, item: Inventory): Promise<Inventory> {
  const res = await apiClient.put<Inventory>(`/api/inventory/${id}`, item);
  return res.data;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  await apiClient.delete(`/api/inventory/${id}`);
}

export async function addSale(sale: Sale): Promise<Sale> {
  const res = await apiClient.post<Sale>('/api/sales', sale);
  return res.data;
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
  const res = await apiClient.get<SummaryData>('/api/summary/daily');
  return res.data;
}

export async function getWeeklySummary(): Promise<SummaryData> {
  const res = await apiClient.get<SummaryData>('/api/summary/weekly');
  return res.data;
}

export async function getMonthlySummary(): Promise<SummaryData> {
  const res = await apiClient.get<SummaryData>('/api/summary/monthly');
  return res.data;
}

export async function getYearlySummary(): Promise<SummaryData> {
  const res = await apiClient.get<SummaryData>('/api/summary/yearly');
  return res.data;
}

// No default export — this is a helper module.
