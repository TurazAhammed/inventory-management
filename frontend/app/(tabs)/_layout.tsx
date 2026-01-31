import { Stack, Tabs, useRouter } from "expo-router";
import '../globals.css';
import React from "react";
import Icon from '@expo/vector-icons/FontAwesome';
import { useTranslation } from 'react-i18next';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const _layout = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t('common.home'),
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarLabel: t('inventory.title'),
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <FontAwesome6 name="boxes-stacked" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          tabBarLabel: t('sales.title'),
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <MaterialIcons name="point-of-sale" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
