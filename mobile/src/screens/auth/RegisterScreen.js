import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { authService } from '../../services/authService';
import { departmentService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);

  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch departments for dropdown
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepts(true);
        const res = await departmentService.getAll();
        const list = Array.isArray(res) ? res : (res?.data || []);
        setDepartments(list.map(d => ({ label: d.name, value: d._id })));
      } catch (err) {
        console.log('Could not load departments for registration:', err.message);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleRegister = async () => {
    setError('');

    // Field validations
    if (!username.trim()) {
      return setError('Please enter your full name or username.');
    }
    if (!email.trim()) {
      return setError('Please enter your email address.');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return setError('Please enter a valid email address.');
    }
    if (!phone.trim()) {
      return setError('Please enter your contact phone number.');
    }
    if (!password) {
      return setError('Please enter a password.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setSubmitting(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: 'User',
      };
      if (department) {
        payload.department = department;
      }

      await authService.register(payload);

      Alert.alert(
        'Registration Successful! 🎉',
        'Your user account has been created. Please sign in with your credentials.',
        [
          {
            text: 'Sign In Now',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={submitting} loadingText="Creating your account...">
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>📝</Text>
          </View>
          <Text style={styles.brandTitle}>Create Account</Text>
          <Text style={styles.brandSub}>Register for Ticket Management Portal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>User Registration</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name / Username"
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. John Doe"
            autoCapitalize="words"
            required
          />

          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +91 9876543210"
            keyboardType="phone-pad"
            required
          />

          <Select
            label="Department (Optional)"
            value={department}
            onValueChange={setDepartment}
            options={departments}
            placeholder={loadingDepts ? 'Loading departments...' : '-- Select Department --'}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            required
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            secureTextEntry
            required
          />

          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={submitting}
            style={styles.registerBtn}
          />

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>TMS Mobile • Complaint Management System</Text>
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
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
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
    fontSize: 18,
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
  },
  registerBtn: {
    marginTop: SPACING.sm,
  },
  loginLink: {
    marginTop: SPACING.md,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  loginLinkText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  loginHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    marginTop: SPACING.lg,
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
});
