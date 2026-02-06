import { Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useAuth } from "@/lib/authContext";

const Layout = () => {
  const { role, isLoading } = useAuth();
  const { t } = useTranslation();

  // ⛔ Wait until auth state is fully loaded
  if (isLoading) {
    return null; // or a splash / loader
  }

  // 🧰 Inventory Admin → Inventory only
  // if (role === "inventory_admin") {
  //   return (
  //     <Tabs key={role}>
  //       <Tabs.Screen
  //         name="inventory"
  //         options={{
  //           tabBarLabel: t("inventory.title"),
  //           headerShown: false,
            
  //           tabBarIcon: ({ color, size }) => (
  //             <FontAwesome6 name="boxes-stacked" size={size} color={color} />
  //           ),
  //         }}
  //       />
  //     </Tabs>
  //   );
  // }

  // // 💰 Sales Admin → Sales only
  // if (role === "sales_admin") {
  //   return (
  //     <Tabs key={role}>
  //       <Tabs.Screen
  //         name="sales"
  //         options={{
  //           tabBarLabel: t("sales.title"),
  //           headerShown: false,
  //           tabBarIcon: ({ color, size }) => (
  //             <MaterialIcons name="point-of-sale" size={size} color={color} />
  //           ),
  //         }}
  //       />
  //     </Tabs>
  //   );
  // }

  // 👑 Super Admin → Everything
  // if (role === "super_admin") {
    return (
      <Tabs key={role}>
        <Tabs.Screen
          name="index"
          options={{
            tabBarLabel: t("common.home"),
            headerShown: false,
            
            tabBarIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="inventory"
          options={{
            tabBarLabel: t("inventory.title"),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <FontAwesome6 name="boxes-stacked" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="sales"
          options={{
            tabBarLabel: t("sales.title"),
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialIcons name="point-of-sale" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    );
  }

  // return null;
// };

export default Layout;
