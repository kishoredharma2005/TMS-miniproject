import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { UserDashboardScreen } from '../screens/user/UserDashboardScreen';
import { CreateTicketScreen } from '../screens/user/CreateTicketScreen';
import { MyTicketsScreen } from '../screens/user/MyTicketsScreen';
import { TicketDetailsScreen } from '../screens/user/TicketDetailsScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const UserTabNavigator = () => {
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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarIcon: ({ color, focused }) => {
          let icon = '🏠';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'MyTickets') icon = '🎫';
          else if (route.name === 'CreateTicket') icon = '➕';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Home" component={UserDashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="MyTickets" component={MyTicketsScreen} options={{ tabBarLabel: 'My Tickets' }} />
      <Tab.Screen name="CreateTicket" component={CreateTicketScreen} options={{ tabBarLabel: 'Raise Ticket' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const UserNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabNavigator} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
    </Stack.Navigator>
  );
};
