import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar } from 'react-native';
import { on } from '@/lib/bus';
import { useTranslation } from 'react-i18next';
import '@/i18n';
import { getDailySummary, getWeeklySummary, getMonthlySummary, getYearlySummary, getInventoryList, getSalesList, type SummaryData } from '@/lib/api';

type PeriodKey = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

const initialSummary: SummaryData = {
  inventory_added: { count: 0, total_qty: 0, total_buy_price: 0 },
  sales: { count: 0, total_qty: 0, total_revenue: 0, total_buy_cost: 0 },
  profit: 0,
};

const Home = () => {
  const [summaries, setSummaries] = useState<Record<PeriodKey, SummaryData>>({
    daily: initialSummary,
    weekly: initialSummary,
    monthly: initialSummary,
    yearly: initialSummary,
    lifetime: initialSummary,
  });
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchAll() {
      try {
        const [daily, weekly, monthly, yearly] = await Promise.all([
          getDailySummary(),
          getWeeklySummary(),
          getMonthlySummary(),
          getYearlySummary(),
        ]);

        // compute lifetime by fetching raw lists
        const [invList, salesList] = await Promise.all([getInventoryList(), getSalesList()]);

        const lifetimeInventoryQty = invList.reduce((s, it) => s + (it.quantity ?? 0), 0);
        const lifetimeInventoryBuy = invList.reduce((s, it) => s + ((it.buy_price ?? 0) * (it.quantity ?? 0)), 0);

        const lifetimeSalesQty = salesList.reduce((s, it) => s + (it.quantity_sold ?? 0), 0);
        const lifetimeSalesRevenue = salesList.reduce((s, it) => s + (it.total_sell ?? ((it.quantity_sold ?? 0) * (it.sell_price ?? 0))), 0);

        // build lookup for inventory buy price by id so we can compute buy-cost of sold items
        const buyPriceById = new Map<number, number>();
        invList.forEach(it => {
          if (it.id != null) buyPriceById.set(it.id, Number(it.buy_price ?? 0));
        });

        // compute total buy cost for sold items using qty_sold * item's buy_price
        const lifetimeSalesBuyCost = salesList.reduce((sum, s) => {
          const buy = s.item_id ? (buyPriceById.get(s.item_id) ?? 0) : 0;
          return sum + ((s.quantity_sold ?? 0) * buy);
        }, 0);

        const lifetime: SummaryData = {
          inventory_added: { count: invList.length, total_qty: lifetimeInventoryQty, total_buy_price: lifetimeInventoryBuy },
          sales: { count: salesList.length, total_qty: lifetimeSalesQty, total_revenue: lifetimeSalesRevenue, total_buy_cost: lifetimeSalesBuyCost },
          profit: Number((lifetimeSalesRevenue - lifetimeSalesBuyCost).toFixed(2)),
        };

        if (!mounted) return;
        setSummaries({ daily, weekly, monthly, yearly, lifetime });
      } catch (err) {
        console.error('Failed to load summaries', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();

    // subscribe to inventory/sales events to refresh summaries instantly
    const unsubInvAdded = on('inventory:added', () => { fetchAll(); });
    const unsubInvUpdated = on('inventory:updated', () => { fetchAll(); });
    const unsubInvDeleted = on('inventory:deleted', () => { fetchAll(); });

    const unsubSalesAdded = on('sales:added', () => { fetchAll(); });
    const unsubSalesUpdated = on('sales:updated', () => { fetchAll(); });
    const unsubSalesDeleted = on('sales:deleted', () => { fetchAll(); });

    return () => { mounted = false; unsubInvAdded(); unsubInvUpdated(); unsubInvDeleted(); unsubSalesAdded(); unsubSalesUpdated(); unsubSalesDeleted(); };
  }, []);

  const renderCard = (title: string, data: SummaryData) => {
    const totalBuyNum = Number(data.inventory_added?.total_buy_price ?? 0);
    const totalSoldNum = Number(data.sales?.total_revenue ?? 0);
    const totalBuy = Number.isFinite(totalBuyNum) ? totalBuyNum : 0;
    const totalSold = Number.isFinite(totalSoldNum) ? totalSoldNum : 0;
    const profit = Number((totalSold - totalBuy).toFixed(2));

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardLine}>{t('summary.addedQty')}: {data.inventory_added.total_qty}</Text>
        <Text style={styles.cardLine}>{t('summary.totalBuyingPrice')}: ${totalBuy.toFixed(2)}</Text>
        <Text style={styles.cardLine}>{t('summary.soldQty')}: {data.sales?.total_qty ?? 0}</Text>
        <Text style={styles.cardLine}>{t('summary.totalSoldPrice')}: ${totalSold.toFixed(2)}</Text>
        <Text style={[styles.cardLine, profit >= 0 ? styles.profitPositive : styles.profitNegative]}>{t('summary.profit')}: ${profit.toFixed(2)}</Text>
      </View>
    );
  };

  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 0 } : {};

  return (
    <SafeAreaView style={[styles.safeArea, androidPadding]}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.header}>{t('summary.header')}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => i18n.changeLanguage('en')} style={{ marginRight: 8 }}>
            <Text style={{ color: i18n.language === 'en' ? '#111' : '#6B7280' }}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => i18n.changeLanguage('bn')}>
            <Text style={{ color: i18n.language === 'bn' ? '#111' : '#6B7280' }}>BN</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <Text style={styles.loading}>{t('summary.loading')}</Text>
      ) : (
        <>
          {renderCard(t('summary.today'), summaries.daily)}
          {renderCard(t('summary.week'), summaries.weekly)}
          {renderCard(t('summary.month'), summaries.monthly)}
          {renderCard(t('summary.year'), summaries.yearly)}
          {renderCard(t('summary.lifetime'), summaries.lifetime)}
        </>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { padding: 16, backgroundColor: '#FFFFFF' },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#1F2937' },
  loading: { color: '#6B7280' },
  card: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  cardLine: { fontSize: 14, color: '#1F2937', marginTop: 4 },
  profitPositive: { color: '#10B981' },
  profitNegative: { color: '#EF4444' },
});

export default Home;
