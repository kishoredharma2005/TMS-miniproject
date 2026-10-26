import React, { useContext, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

import { showConfirm, showAlert } from '../../utils/alertHelper';

export const ProfileScreen = ({ navigation }) => {
  const { user, role, logout, apiUrl, updateApiUrl } = useContext(AuthContext);

  const [serverUrl, setServerUrl] = useState(apiUrl);
  const [editingUrl, setEditingUrl] = useState(false);

  const handleLogout = () => {
    showConfirm(
      'Confirm Logout',
      'Are you sure you want to log out of your session?',
      () => logout(),
      'Logout'
    );
  };

  const handleSaveUrl = () => {
    if (serverUrl.trim()) {
      updateApiUrl(serverUrl.trim());
      setEditingUrl(false);
      showAlert('Updated', 'API endpoint updated successfully.');
    }
  };

  return (
    <ScreenWrapper>
      <Header title="User Profile" subtitle="Account details & configuration" />

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Badge */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.username || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'email@example.com'}</Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Role: {role}</Text>
          </View>
        </Card>

        {/* Profile Info Details */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionHeader}>Personal Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{user?.username || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{user?.phone || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department</Text>
            <Text style={styles.infoValue}>{user?.department?.name || '-'}</Text>
          </View>
        </Card>

        {/* Server & Connectivity Settings */}
        <Card style={styles.infoCard}>
          <View style={styles.serverHeaderRow}>
            <Text style={styles.sectionHeader}>Server API Configuration</Text>
            <TouchableOpacity onPress={() => setEditingUrl(!editingUrl)}>
              <Text style={styles.editText}>{editingUrl ? 'Cancel' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>

          {editingUrl ? (
            <View>
              <Input
                label="API Base URL"
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://10.0.2.2:5000/api"
                autoCapitalize="none"
              />
              <Button
                title="Save Endpoint"
                onPress={handleSaveUrl}
                size="small"
                style={styles.saveBtn}
              />
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current URL</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {apiUrl}
              </Text>
            </View>
          )}
        </Card>

        {/* Logout Button */}
        <Button
          title="🚪 Log Out"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutBtn}
        />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
  },
  profileHeaderCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.primary,
  },
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    maxWidth: '65%',
  },
  serverHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    marginTop: SPACING.xs,
  },
  logoutBtn: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
});
