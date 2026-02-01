import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView, Platform, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { on, emit } from '@/lib/bus';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getInventoryList, updateInventoryItem, deleteInventoryItem, type Inventory } from '@/lib/api';

// Load Tailwind theme values to reuse palette and radii in styles
// @ts-ignore - importing JS config into TSX for runtime theme use
const tailwindConfig = require('../../tailwind.config.js');
const theme = tailwindConfig?.theme?.extend ?? {};
const themeColors = theme.colors || {};
const themeRadii = theme.borderRadius || {};
const pxToNum = (v: any) => (typeof v === 'string' && v.endsWith('px')) ? parseInt(v, 10) : (typeof v === 'number' ? v : undefined);

export default function Inventory() {
  const router = useRouter();
  const { t } = useTranslation();
  const [items, setItems] = useState<Inventory[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<Inventory | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editSellPrice, setEditSellPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const openEditModal = (item: Inventory) => {
    setEditingItem(item);
    setEditName(item.name ?? '');
    setEditQuantity(String(item.quantity ?? ''));
    setEditBuyPrice(String(item.buy_price ?? ''));
    setEditSellPrice(String(item.sell_price ?? ''));
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    const id = editingItem.id;
    if (!id) return;
    const payload: Inventory = {
      ...editingItem,
      name: editName,
      quantity: parseInt(editQuantity, 10) || 0,
      buy_price: parseFloat(editBuyPrice) || 0,
      sell_price: parseFloat(editSellPrice) || 0,
    };
    setSaving(true);
    try {
      const updated = await updateInventoryItem(id, payload);
      setItems(prev => prev ? prev.map(p => (p.id === updated.id ? updated : p)) : prev);
      emit('inventory:updated', updated);
      setEditingItem(null);
    } catch (err: any) {
      Alert.alert(t('inventory.updateFailed') || 'Failed to update item', err?.message ?? String(err));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id?: number) => {
    if (!id) return;
    Alert.alert(
      t('common.confirm') || 'Confirm',
      t('inventory.confirmDelete') || 'Delete this item?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        { text: t('common.delete') || 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteInventoryItem(id);
            setItems(prev => prev ? prev.filter(p => p.id !== id) : prev);
            emit('inventory:deleted', id);
          } catch (err: any) {
            Alert.alert(t('inventory.deleteFailed') || 'Delete failed', err?.message ?? String(err));
          }
        } }
      ]
    );
  };

  useEffect(() => {
    let mounted = true;
    getInventoryList()
      .then((data: Inventory[]) => { if (mounted) setItems(data); })
      .catch((err: any) => {
        console.error(err);
        if (mounted) setError(err.message || 'Failed to fetch inventory');
      });

    const unsubAdded = on('inventory:added', (newItem: Inventory) => {
      setItems(prev => prev ? [newItem, ...prev] : [newItem]);
    });
    const unsubUpdated = on('inventory:updated', (updated: Inventory) => {
      setItems(prev => prev ? prev.map(p => (p.id === updated.id ? updated : p)) : prev);
    });
    const unsubDeleted = on('inventory:deleted', (id: number) => {
      setItems(prev => prev ? prev.filter(p => p.id !== id) : prev);
    });

    return () => { mounted = false; unsubAdded(); unsubUpdated(); unsubDeleted(); };
  }, []);

  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 0 } : {};

  return (
    <SafeAreaView style={[styles.safeArea, androidPadding]}>
      <Text style={styles.header}>{t('inventory.title')}</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {items === null ? (
        <ActivityIndicator size="large" color={((themeColors.secondary && (themeColors.secondary.DEFAULT || themeColors.secondary)) || '#E0244E')} style={{ marginTop: 20 }} />
      ) : items.length === 0 ? (
        <Text style={styles.noItems}>{t('inventory.noItems')}</Text>
      ) : (
        <>
          <FlatList
            data={items}
            style={styles.list}
            contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
            keyExtractor={(item: Inventory) => (item.id?.toString() ?? Math.random().toString())}
            renderItem={({ item }: { item: Inventory }) => (
              <View style={styles.item}>
                <Text style={styles.name}>{item.name ?? (t('common.noItems'))}</Text>
                <Text style={styles.detail}>{t('inventory.id')}: {item.id}</Text>
                <Text style={styles.detail}>{t('inventory.quantity')}: {item.quantity ?? 0}</Text>
                <Text style={styles.calculatedPrice}>
                  {t('inventory.unitBuyPrice')}: {item.buy_price ?? '-'} | {t('inventory.unitSellPrice')}: {item.sell_price ?? '-'}
                </Text>
                <Text style={styles.totalPrice}>
                  {t('inventory.totalBuyPrice')}: {item.buy_price && item.quantity ? (item.buy_price * item.quantity).toFixed(2) : '-'}
                </Text>
                <Text style={styles.detail}>{t('inventory.active')}: {item.is_active ? t('inventory.yes') : t('inventory.no')}</Text>
                <Text style={styles.small}>{t('inventory.added')}: {item.created_at ?? '-'}</Text>
                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                  <TouchableOpacity style={{ marginRight: 12 }} onPress={() => openEditModal(item)}>
                    <Text style={{ color: ((themeColors.primary && (themeColors.primary['600'] || themeColors.primary[600])) || '#2563EB') }}>{t('common.edit') || 'Edit'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                    <Text style={{ color: ((themeColors.error || '#EF4444')) }}>{t('common.delete') || 'Delete'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('../add-inventory')}
          >
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </>
      )}
      
      <Modal visible={!!editingItem} transparent={true} animationType="slide" onRequestClose={() => setEditingItem(null)}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>{t('inventory.editItem') || 'Edit Item'}</Text>
            <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder={t('addInventory.itemNamePlaceholder')} />
            <TextInput style={styles.input} value={editQuantity} onChangeText={setEditQuantity} keyboardType="numeric" placeholder={t('addInventory.quantityPlaceholder')} />
            <TextInput style={styles.input} value={editBuyPrice} onChangeText={setEditBuyPrice} keyboardType="decimal-pad" placeholder={t('addInventory.buyPricePlaceholder')} />
            <TextInput style={styles.input} value={editSellPrice} onChangeText={setEditSellPrice} keyboardType="decimal-pad" placeholder={t('addInventory.sellPricePlaceholder')} />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
              <TouchableOpacity onPress={() => setEditingItem(null)} style={{ marginRight: 12 }}>
                <Text style={{ color: (themeColors.muted || '#6B7280') }}>{t('common.cancel') || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit}>
                <Text style={{ color: ((themeColors.accent && (themeColors.accent.DEFAULT || themeColors.accent)) || '#10B981'), fontWeight: '600' }}>{t('common.save') || 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: (themeColors.surface || '#FFFFFF') },
  // `list` style is applied to FlatList; padding is provided via contentContainerStyle
  list: { flex: 1, backgroundColor: (themeColors.surface || '#FFFFFF') },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12, paddingHorizontal: 16, color: ((themeColors.primary && (themeColors.primary.DEFAULT || themeColors.primary)) || '#1F2937') },
  error: { color: (themeColors.error || '#FF3B30'), marginBottom: 8, fontSize: 14 },
  noItems: { fontSize: 14, color: (themeColors.muted || '#6B7280'), marginTop: 20, textAlign: 'center' as const },
  item: { 
    padding: 12, 
    borderWidth: 1, 
    borderColor: ((themeColors.neutral && (themeColors.neutral['100'] || themeColors.neutral[100])) || '#E5E7EB'), 
    borderRadius: (pxToNum(themeRadii.DEFAULT) || 8), 
    marginBottom: 12,
    backgroundColor: (themeColors.surface || '#FFFFFF'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  detail: { fontSize: 14, color: ((themeColors.neutral && (themeColors.neutral['900'] || themeColors.neutral[900])) || '#1F2937'), marginTop: 4 },
  name: { fontSize: 16, fontWeight: '500', color: ((themeColors.neutral && (themeColors.neutral['900'] || themeColors.neutral[900])) || '#1F2937') },
  calculatedPrice: { fontSize: 14, fontWeight: '500', color: ((themeColors.secondary && (themeColors.secondary.DEFAULT || themeColors.secondary)) || '#E0244E'), marginTop: 8 },
  totalPrice: { fontSize: 14, fontWeight: '600', color: (themeColors.success || '#34C759'), marginTop: 8, marginBottom: 8 },
  small: { fontSize: 12, color: (themeColors.muted || '#6B7280'), marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
    marginTop: 8,
  },
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