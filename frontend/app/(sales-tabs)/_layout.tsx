import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const SalesLayout = () => {
	const { t } = useTranslation();

	return (
		<Tabs>
			<Tabs.Screen
				name="sales"
				options={{
					headerShown: false,
					tabBarLabel: t('sales.title'),
					tabBarIcon: ({ color, size }) => <MaterialIcons name="point-of-sale" size={size} color={color} />,
				}}
			/>
		</Tabs>
	);
};

export default SalesLayout;
