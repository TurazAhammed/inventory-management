import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { addInventoryItem, type Inventory } from '@/lib/api';
import { emit } from '@/lib/bus';

export default function AddInventory() {
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAddItem = async () => {
    if (!name.trim() || !quantity.trim()) {
      Alert.alert(t('addInventory.error'), t('addInventory.nameQuantityRequired'));
      return;
    }

    const newItem: Inventory = {
      name: name.trim(),
      buy_price: buyPrice ? parseFloat(buyPrice) : 0,
      sell_price: sellPrice ? parseFloat(sellPrice) : 0,
      quantity: parseInt(quantity, 10),
      is_active: isActive ? 1 : 0,
    };

    try {
      setLoading(true);
      const created = await addInventoryItem(newItem);
      // notify listeners so lists update immediately
      emit('inventory:added', created);
      Alert.alert(t('addInventory.success'), t('addInventory.itemAdded'));
      router.back();
    } catch (err) {
      Alert.alert(t('addInventory.error'), err instanceof Error ? err.message : t('addInventory.failedToAdd'));
    } finally {
      setLoading(false);
    }
  };

  const androidPadding = Platform.OS === 'android' ? { paddingTop: StatusBar.currentHeight ?? 0 } : {};

  return (
    <SafeAreaView style={[styles.safeArea, androidPadding]}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>{t('addInventory.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('addInventory.title')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addInventory.itemName')} {t('addInventory.required')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addInventory.itemNamePlaceholder')}
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addInventory.quantity')} {t('addInventory.required')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addInventory.quantityPlaceholder')}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addInventory.buyPrice')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addInventory.buyPricePlaceholder')}
            value={buyPrice}
            onChangeText={setBuyPrice}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addInventory.sellPrice')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('addInventory.sellPricePlaceholder')}
            value={sellPrice}
            onChangeText={setSellPrice}
            keyboardType="decimal-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t('addInventory.active')}</Text>
          <TouchableOpacity
            style={[styles.checkbox, isActive && styles.checkboxChecked]}
            onPress={() => setIsActive(!isActive)}
            disabled={loading}
          >
            <Text style={styles.checkboxText}>{isActive ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleAddItem}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? t('addInventory.adding') : t('addInventory.addButton')}
          </Text>
        </TouchableOpacity>
      </View>
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
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
    color: '#1F2937',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F9FAFB',
  },
  checkboxChecked: {
    borderColor: '#E0244E',
    backgroundColor: '#E0244E',
  },
  checkboxText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
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
});
