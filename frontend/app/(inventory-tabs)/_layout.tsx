import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const InventoryLayout = () => {
	const { t } = useTranslation();

	return (
		<Tabs>
			<Tabs.Screen
				name="inventory"
				options={{
					headerShown: false,
					tabBarLabel: t('inventory.title'),
					tabBarIcon: ({ color, size }) => <FontAwesome6 name="boxes-stacked" size={size} color={color} />,
				}}
			/>
		</Tabs>
	);
};

export default InventoryLayout;
