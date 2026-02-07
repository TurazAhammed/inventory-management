// import { Tabs } from 'expo-router';
// import React from 'react';
// import { useTranslation } from 'react-i18next';
// import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
// import MaterialIcons from '@expo/vector-icons/MaterialIcons';
// import FontAwesome from '@expo/vector-icons/FontAwesome';
// import { useAuth } from '@/lib/authContext';

// const TabsLayout = () => {
//   const { role, isLoading } = useAuth();
//   const { t } = useTranslation();

//   if (isLoading) return null;

//   if (role === 'inventory_admin') {
//     return (
//       <Tabs key={role}>
//         <Tabs.Screen name="inventory" options={{ headerShown: false, tabBarLabel: t('inventory.title'), tabBarIcon: ({ color, size }) => (<FontAwesome6 name="boxes-stacked" size={size} color={color} />) }} />
//       </Tabs>
//     );
//   }

//   if (role === 'sales_admin') {
//     return (
//       <Tabs key={role}>
//         <Tabs.Screen name="sales" options={{ headerShown: false, tabBarLabel: t('sales.title'), tabBarIcon: ({ color, size }) => (<MaterialIcons name="point-of-sale" size={size} color={color} />) }} />
//       </Tabs>
//     );
//   }

//   return (
//     <Tabs key={role}>
//       <Tabs.Screen name="index" options={{ headerShown: false, tabBarLabel: t('common.home'), tabBarIcon: ({ color, size }) => (<FontAwesome name="home" size={size} color={color} />) }} />
//       <Tabs.Screen name="inventory" options={{ headerShown: false, tabBarLabel: t('inventory.title'), tabBarIcon: ({ color, size }) => (<FontAwesome6 name="boxes-stacked" size={size} color={color} />) }} />
//       <Tabs.Screen name="sales" options={{ headerShown: false, tabBarLabel: t('sales.title'), tabBarIcon: ({ color, size }) => (<MaterialIcons name="point-of-sale" size={size} color={color} />) }} />
//     </Tabs>
//   );
// };

// export default TabsLayout;
