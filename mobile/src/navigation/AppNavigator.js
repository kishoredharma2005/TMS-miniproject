import React, { useContext } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { UserNavigator } from './UserNavigator';
import { TechnicianNavigator } from './TechnicianNavigator';
import { AdminNavigator } from './AdminNavigator';
import { COLORS } from '../utils/theme';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, isSuperAdmin, isTechnician } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashLogo}>🎫</Text>
        <Text style={styles.splashTitle}>TMS Mobile</Text>
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isSuperAdmin ? (
          <Stack.Screen name="AdminApp" component={AdminNavigator} />
        ) : isTechnician ? (
          <Stack.Screen name="TechnicianApp" component={TechnicianNavigator} />
        ) : (
          <Stack.Screen name="UserApp" component={UserNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 64,
    marginBottom: 12,
  },
  splashTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
});
