// React + React Native imports
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';

// i18n for translations
import { useTranslation } from 'react-i18next';

// Simple event bus used to append new sales pushed elsewhere in the app
import { on } from '@/lib/bus';

// Router to navigate to the add-sales screen
import { useRouter } from 'expo-router';

// API helper to fetch sales and the Sale type
import { getSalesList, type Sale } from '../../lib/api';

// Load Tailwind theme values so we can reuse colors, fonts, radii in React Native styles
// @ts-ignore - importing JS config into TSX for runtime theme use
const tailwindConfig = require('../../tailwind.config.js');
const theme = tailwindConfig?.theme?.extend ?? {};
const themeColors = theme.colors ?? {};
const themeFonts = theme.fontFamily || {};
const themeRadii = theme.borderRadius ?? {};
const defaultFont = Array.isArray(themeFonts.sans) ? themeFonts.sans[0] : (themeFonts.sans || 'System');
const pxToNum = (v: any) => (typeof v === 'string' && v.endsWith('px')) ? parseInt(v, 10) : (typeof v === 'number' ? v : undefined);

// Sales screen component: lists sales and provides a FAB to add new sales
const Sales = () => {
  const router = useRouter();
  const { t } = useTranslation();

  // `items` holds the fetched list of sales. `null` means still loading.
  const [items, setItems] = useState<Sale[] | null>(null);

  // `error` stores any fetch error message for simple display
  const [error, setError] = useState<string | null>(null);

  // Fetch sales on mount and subscribe to realtime additions
  useEffect(() => {
    let mounted = true;

    // Initial fetch of sales list
    getSalesList()
      .then(data => { if (mounted) setItems(data); })
      .catch(err => { console.error(err); if (mounted) setError(err.message || 'Failed to fetch sales'); });

    // Subscribe to `sales:added` events so new sales appear at top
    const unsub = on('sales:added', (s: Sale) => {
      setItems(prev => prev ? [s, ...prev] : [s]);
    });

    // Cleanup: mark unmounted (prevents state updates) and allow unsub if provided
    return () => { mounted = false; if (typeof unsub === 'function') unsub(); };
  }, []);

  // Add padding on Android to account for the status bar height
  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 0 } : {};

  return (
    <SafeAreaView style={[styles.safeArea, androidPadding]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Screen title */}
        <Text style={styles.title}>{t('sales.title')}</Text>

        {/* Display fetch error if present */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Loading state: `items === null` shows spinner */}
        {items === null ? (
          <ActivityIndicator size="large" color={((themeColors.secondary && (themeColors.secondary.DEFAULT || themeColors.secondary)) || '#E0244E')} style={{ marginTop: 20 }} />

        /* Empty state: no sales */
        ) : items.length === 0 ? (
          <Text style={styles.noItems}>{t('sales.noItems')}</Text>

        /* List state: render each sale as a card */
        ) : (
          items.map((s, index) => {
            // Compute total: prefer explicit `total_sell`, otherwise multiply qty * price
            const rawTotal = s.total_sell ?? (s.quantity_sold && s.sell_price ? (Number(s.quantity_sold) * Number(s.sell_price)) : undefined);
            const totalNum = typeof rawTotal === 'number' ? rawTotal : (rawTotal ? Number(rawTotal) : NaN);
            const totalText = Number.isFinite(totalNum) ? totalNum.toFixed(2) : '0.00';

            return (
              <View key={index.toString()} style={styles.card}>
                {/* Primary identifier line */}
                <Text style={styles.name}>
                  {s.item_name ?? `${t('sales.itemId')} #${s.item_id}`}
                </Text>

                {/* Details about the sale */}
                <Text style={styles.detail}>{t('sales.itemId')}: {s.id}</Text>
                <Text style={styles.detail}>{t('inventory.quantity')}: {s.quantity_sold}</Text>
                <Text style={styles.detail}>{t('inventory.unitSellPrice')}: {s.sell_price}</Text>

                {/* Formatted total sale amount */}
                <Text style={styles.totalText}>{t('sales.totalSale')}: ${totalText}</Text>

                {/* Small meta line (timestamp) */}
                <Text style={styles.small}>{t('sales.soldAt')}: {s.sold_at ?? '—'}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Floating action button: navigate to add-sales screen */}
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
  safeArea: { flex: 1, backgroundColor: themeColors.surface ?? '#FFFFFF' },
  // ScrollView fills the area; padding moved into contentContainerStyle so content can scroll
  container: { flex: 1, backgroundColor: (themeColors.surface || '#FFFFFF') },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12, color: ((themeColors.primary && (themeColors.primary.DEFAULT || themeColors.primary)) || '#1F2937'), fontFamily: defaultFont },
  error: { color: (themeColors.error || '#FF3B30'), marginBottom: 8, fontSize: 14 },
  noItems: { fontSize: 14, color: (themeColors.muted || '#6B7280'), marginTop: 20, textAlign: 'center' as const },
  card: { 
    padding: 12, 
    borderWidth: 1, 
    borderColor: ((themeColors.neutral && (themeColors.neutral['100'] || themeColors.neutral[100])) || '#E5E7EB'), 
    borderRadius: (pxToNum(themeRadii.DEFAULT) || 8),
    marginBottom: 12,
    backgroundColor: themeColors.surface ?? '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detail: { fontSize: 14, color: ((themeColors.neutral && (themeColors.neutral['900'] || themeColors.neutral[900])) || '#1F2937'), marginTop: 4, fontFamily: defaultFont },
  name: { fontSize: 16, fontWeight: '500', color: ((themeColors.neutral && (themeColors.neutral['900'] || themeColors.neutral[900])) || '#1F2937'), fontFamily: defaultFont },
  totalText: { fontSize: 14, fontWeight: '600', color: (themeColors.success || '#34C759'), marginTop: 8 },
  small: { fontSize: 12, color: (themeColors.muted || '#6B7280'), marginTop: 8 },
  fab: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 999,
    backgroundColor: ((themeColors.primary && (themeColors.primary.DEFAULT || themeColors.primary)) || '#E0244E'),
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