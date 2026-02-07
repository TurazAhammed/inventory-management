import { Stack } from "expo-router";
import { AuthProvider, useAuth } from '@/lib/authContext';
import './globals.css';
import { ActivityIndicator, View } from "react-native";

const RootLayoutContent = () => {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If no token, show login screen; otherwise show tabs
  return (
    <Stack>
      {!token ? (
        <Stack.Screen name="login" options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="(admin-tabs)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
};

const RootLayout = () => {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
};

export default RootLayout;


