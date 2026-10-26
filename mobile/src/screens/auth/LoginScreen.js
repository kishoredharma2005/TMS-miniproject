import React, { useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const LoginScreen = ({ navigation }) => {
  const { login, apiUrl, updateApiUrl } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Developer mode API base URL toggle
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(apiUrl);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    const result = await login(email.trim(), password.trim());
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed. Please check your credentials.');
    }
  };

  const handleSaveApiUrl = () => {
    if (customUrl.trim()) {
      updateApiUrl(customUrl.trim());
      Alert.alert('API Base URL Saved', `Server endpoint set to:\n${customUrl.trim()}`);
    }
  };

  return (
    <ScreenWrapper loading={loading} loadingText="Signing in...">
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🎫</Text>
          </View>
          <Text style={styles.brandTitle}>Ticket Management</Text>
          <Text style={styles.brandSub}>Complaint Management System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Login</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            required
          />

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          <TouchableOpacity
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account? <Text style={styles.registerHighlight}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.configToggle}
            onPress={() => setShowApiConfig(!showApiConfig)}
          >
            <Text style={styles.configToggleText}>
              ⚙️ Server Endpoint: {apiUrl}
            </Text>
          </TouchableOpacity>

          {showApiConfig && (
            <View style={styles.configBox}>
              <Input
                label="Backend API Base URL"
                value={customUrl}
                onChangeText={setCustomUrl}
                placeholder="http://10.0.2.2:5000/api"
                autoCapitalize="none"
              />
              <Button
                title="Save API Endpoint"
                onPress={handleSaveApiUrl}
                variant="secondary"
                size="small"
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TMS Mobile v1.0 • MERN Stack Migration</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  logoIcon: {
    fontSize: 36,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  errorBox: {
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
  },
  loginBtn: {
    marginTop: SPACING.sm,
  },
  registerLink: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  registerLinkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  registerHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  configToggle: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  configToggleText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  configBox: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
