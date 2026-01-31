import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useTranslation } from 'react-i18next';
import { on } from '@/lib/bus';
import { useRouter } from 'expo-router';
import { getSalesList, type Sale } from '../../lib/api';

const Sales = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const [items, setItems] = useState<Sale[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSalesList()
      .then(data => { if (mounted) setItems(data); })
      .catch(err => { console.error(err); if (mounted) setError(err.message || 'Failed to fetch sales'); });
    const unsub = on('sales:added', (s: Sale) => {
      setItems(prev => prev ? [s, ...prev] : [s]);
    });
    return () => { mounted = false; };
  }, []);

  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 0 } : {};

  return (
    <SafeAreaView style={[styles.safeArea, androidPadding]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{t('sales.title')}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {items === null ? (
          <ActivityIndicator size="large" color="#E0244E" style={{ marginTop: 20 }} />
        ) : items.length === 0 ? (
          <Text style={styles.noItems}>{t('sales.noItems')}</Text>
        ) : (
          items.map((s, index) => {
            const rawTotal = s.total_sell ?? (s.quantity_sold && s.sell_price ? (Number(s.quantity_sold) * Number(s.sell_price)) : undefined);
            const totalNum = typeof rawTotal === 'number' ? rawTotal : (rawTotal ? Number(rawTotal) : NaN);
            const totalText = Number.isFinite(totalNum) ? totalNum.toFixed(2) : '0.00';

            return (
              <View key={index.toString()} style={styles.card}>
                <Text style={styles.name}>{t('sales.itemId')} #{s.id}</Text>
                <Text style={styles.detail}>{t('sales.itemId')}: {s.item_id}</Text>
                <Text style={styles.detail}>{t('inventory.quantity')}: {s.quantity_sold}</Text>
                <Text style={styles.detail}>{t('inventory.unitSellPrice')}: {s.sell_price}</Text>
                <Text style={styles.totalText}>{t('sales.totalSale')}: ${totalText}</Text>
                <Text style={styles.small}>{t('sales.soldAt')}: {s.sold_at ?? '—'}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('../add-sales')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: '#1F2937' },
  error: { color: '#FF3B30', marginBottom: 8, fontSize: 14 },
  noItems: { fontSize: 14, color: '#6B7280', marginTop: 20, textAlign: 'center' as const },
  card: { 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 8, 
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detail: { fontSize: 14, color: '#1F2937', marginTop: 4 },
  name: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  totalText: { fontSize: 14, fontWeight: '600', color: '#34C759', marginTop: 8 },
  small: { fontSize: 12, color: '#6B7280', marginTop: 8 },
  fab: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: '#E0244E',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default Sales;