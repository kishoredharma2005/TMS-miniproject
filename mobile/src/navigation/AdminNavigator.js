import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';

import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { ViewAllTicketsScreen } from '../screens/admin/ViewAllTicketsScreen';
import { ManageUsersScreen } from '../screens/admin/ManageUsersScreen';
import { ManageTechniciansScreen } from '../screens/admin/ManageTechniciansScreen';
import { ManageDepartmentsScreen } from '../screens/admin/ManageDepartmentsScreen';
import { ManageProgrammesScreen } from '../screens/admin/ManageProgrammesScreen';
import { ManageBlocksScreen } from '../screens/admin/ManageBlocksScreen';
import { ManageRoomsScreen } from '../screens/admin/ManageRoomsScreen';
import { ManageRolesScreen } from '../screens/admin/ManageRolesScreen';
import { ReportsScreen } from '../screens/admin/ReportsScreen';
import { TicketDetailsScreen } from '../screens/user/TicketDetailsScreen';
import { ProfileScreen } from '../screens/user/ProfileScreen';
import { COLORS } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminTabNavigator = () => {
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
          let icon = '⚡';
          if (route.name === 'Dashboard') icon = '⚡';
          else if (route.name === 'Tickets') icon = '🎫';
          else if (route.name === 'Users') icon = '👥';
          else if (route.name === 'Reports') icon = '📊';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: 20 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ tabBarLabel: 'Control' }} />
      <Tab.Screen name="Tickets" component={ViewAllTicketsScreen} options={{ tabBarLabel: 'All Tickets' }} />
      <Tab.Screen name="Users" component={ManageUsersScreen} options={{ tabBarLabel: 'Users' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

export const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="ViewAllTickets" component={ViewAllTicketsScreen} />
      <Stack.Screen name="ManageUsers" component={ManageUsersScreen} />
      <Stack.Screen name="ManageTechnicians" component={ManageTechniciansScreen} />
      <Stack.Screen name="ManageDepartments" component={ManageDepartmentsScreen} />
      <Stack.Screen name="ManageProgrammes" component={ManageProgrammesScreen} />
      <Stack.Screen name="ManageBlocks" component={ManageBlocksScreen} />
      <Stack.Screen name="ManageRooms" component={ManageRoomsScreen} />
      <Stack.Screen name="ManageRoles" component={ManageRolesScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} />
    </Stack.Navigator>
  );
};
