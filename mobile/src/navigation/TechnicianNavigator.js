import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { TechnicianDashboardScreen } from '../screens/technician/TechnicianDashboardScreen';
import { AssignedTicketsScreen } from '../screens/technician/AssignedTicketsScreen';
import { TechnicianTicketDetailsScreen } from '../screens/technician/TechnicianTicketDetailsScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TechnicianTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.purple,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, focused }) => {
          let icon = '🛠️';
          if (route.name === 'Home') icon = '📊';
          else if (route.name === 'AssignedTickets') icon = '📋';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={TechnicianDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="AssignedTickets" component={AssignedTicketsScreen} options={{ tabBarLabel: 'Assigned Work' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const TechnicianNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TechnicianTabs" component={TechnicianTabNavigator} />
      <Stack.Screen name="TechnicianTicketDetails" component={TechnicianTicketDetailsScreen} />
    </Stack.Navigator>
  );
};
