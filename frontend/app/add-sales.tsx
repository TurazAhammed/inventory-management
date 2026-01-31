import { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, FlatList, Modal, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { addSale, getInventoryList, type Sale, type Inventory } from '../lib/api';
import { emit } from '@/lib/bus';
import { useTranslation } from 'react-i18next';

export default function AddSales() {
  const router = useRouter();
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [quantitySold, setQuantitySold] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let mounted = true;
    getInventoryList()
      .then(data => {
        if (mounted) {
          setInventory(data);
          setInventoryLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          Alert.alert('Error', 'Failed to fetch inventory');
          setInventoryLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const handleAddSale = async () => {
    if (!selectedItem) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (!quantitySold.trim() || !sellPrice.trim()) {
      Alert.alert(t('addSales.error'), t('addSales.itemQuantityPriceRequired'));
      return;
    }

    const qty = parseInt(quantitySold, 10);
    const price = parseFloat(sellPrice);

    if (qty <= 0) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (price <= 0) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const availableQty = selectedItem.quantity ?? 0;
    if (qty > availableQty) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    const newSale: Sale = {
      item_id: selectedItem.id!,
      quantity_sold: qty,
      sell_price: price,
    };

    try {
      setLoading(true);
      const created = await addSale(newSale);
      emit('sales:added', created);
      Alert.alert(t('addSales.success'), t('addSales.recorded'));
      router.back();
    } catch (err) {
      Alert.alert(t('addSales.error'), err instanceof Error ? err.message : t('addSales.failedToRecord'));
    } finally {
      setLoading(false);
    }
  };

  const activeInventory = inventory.filter(item => item.is_active);

  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 0 } : {};

  return (
    <SafeAreaView style={[styles.safeArea, androidPadding]}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{t('addSales.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('addSales.title')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addSales.itemId')} {t('addInventory.required')}</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowPicker(true)}
            disabled={loading || inventoryLoading}
          >
            <Text style={selectedItem ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
              {selectedItem ? selectedItem.name : t('addSales.itemIdPlaceholder')}
            </Text>
          </TouchableOpacity>
          {selectedItem && (
            <View style={styles.itemInfo}>
              <Text>ID: {selectedItem.id}</Text>
              <Text>Quantity: {selectedItem.quantity ?? 0}</Text>
              <Text>Sell Price: {selectedItem.sell_price ?? '-'}</Text>
            </View>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addSales.quantity')} {t('addInventory.required')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addSales.quantityPlaceholder')}
            value={quantitySold}
            onChangeText={setQuantitySold}
            keyboardType="numeric"
            editable={!loading && selectedItem !== null}
          />
          {selectedItem && quantitySold && parseInt(quantitySold, 10) > (selectedItem.quantity ?? 0) && (
            <Text style={styles.warning}>{t('addSales.exceedsStock')}</Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addSales.salePrice')} {t('addInventory.required')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addSales.pricePlaceholder')}
            value={sellPrice}
            onChangeText={setSellPrice}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        {selectedItem && quantitySold && sellPrice && (
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>{t('sales.totalSale')}</Text>
            <Text style={styles.totalAmount}>
              {(parseInt(quantitySold, 10) * parseFloat(sellPrice)).toFixed(2)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, (loading || !selectedItem) && styles.submitButtonDisabled]}
          onPress={handleAddSale}
          disabled={loading || !selectedItem}
        >
            <Text style={styles.submitButtonText}>
              {loading ? t('addSales.adding') : t('addSales.addButton')}
            </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('addSales.itemIdPlaceholder')}</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {inventoryLoading ? (
              <Text style={styles.modalText}>{t('common.loading')}</Text>
            ) : activeInventory.length === 0 ? (
              <Text style={styles.modalText}>{t('inventory.noItems')}</Text>
            ) : (
              <FlatList
                data={activeInventory}
                keyExtractor={(item: Inventory) => item.id?.toString() ?? Math.random().toString()}
                renderItem={({ item }: { item: Inventory }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedItem(item);
                      setSellPrice((item.sell_price ?? '').toString());
                      setShowPicker(false);
                    }}
                  >
                    <View style={styles.modalItemContent}>
                      <Text style={styles.modalItemName}>{item.name}</Text>
                      <Text style={styles.modalItemDetails}>
                        {t('inventory.quantity')}: {item.quantity} | {t('inventory.unitSellPrice')}: {item.sell_price}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  backButton: {
    fontSize: 14,
    color: '#E0244E',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center' as const,
  },
  pickerButtonText: {
    fontSize: 14,
    color: '#1F2937',
  },
  pickerButtonPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  itemInfo: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E0244E',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  warning: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 8,
  },
  totalBox: {
    backgroundColor: '#E8F4F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    borderLeftWidth: 4,
    borderLeftColor: '#E0244E',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E0244E',
  },
  submitButton: {
    backgroundColor: '#E0244E',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  modalText: {
    textAlign: 'center' as const,
    paddingVertical: 20,
    color: '#6B7280',
  },
  modalItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemContent: {
    padding: 12,
  },
  modalItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalItemDetails: {
    fontSize: 12,
    color: '#6B7280',
  },
});
