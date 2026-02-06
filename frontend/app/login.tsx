import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/lib/authContext';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error') || 'Error', t('auth.requiredFields') || 'Email and password are required');
      return;
    }

    setLoading(true);
    try {
      const newRole = await login(email, password);
      // route based on role
      if (newRole === 'inventory_admin') {
        router.replace('/(inventory-tabs)/inventory');
      } else if (newRole === 'sales_admin') {
        router.replace('/(sales-tabs)/sales');
      } else if (newRole === 'super_admin') {
        //router.replace('/(tabs)/');
        router.replace('/(tabs)/inventory');
        router.replace('/(tabs)/sales');
      } else {
        //router.replace('/(admin-tabs)/');
      }
    } catch (error: any) {
      Alert.alert(t('common.error') || 'Error', error.message || t('auth.loginFailed') || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('auth.title') || 'Inventory Management'}</Text>
        <Text style={styles.subtitle}>{t('auth.loginTitle') || 'Login'}</Text>

        <TextInput
          style={styles.input}
          placeholder={t('auth.emailPlaceholder') || 'Email'}
          value={email}
          onChangeText={setEmail}
          editable={!loading}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.passwordPlaceholder') || 'Password'}
          value={password}
          onChangeText={setPassword}
          editable={!loading}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('auth.loginButton') || 'Login'}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          {t('auth.demoHint') || 'Demo credentials: test@example.com / password123'}
        </Text>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#F9FAFB',
  },
  button: {
    width: '100%',
    backgroundColor: '#E0244E',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginTop: 24,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
