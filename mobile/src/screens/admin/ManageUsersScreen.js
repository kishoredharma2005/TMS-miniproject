import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { userService } from '../../services/userService';
import { departmentService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { USER_ROLES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Form modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'User',
    department: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsersAndDepts = useCallback(async () => {
    try {
      setError('');
      const [userRes, deptRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll().catch(() => []),
      ]);
      setUsers(Array.isArray(userRes) ? userRes : (userRes?.data || []));
      const deptList = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);
      setDepartments(deptList.map(d => ({ label: d.name, value: d._id })));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsersAndDepts();
  }, [loadUsersAndDepts]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsersAndDepts();
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      username: '',
      email: '',
      phone: '',
      password: '',
      role: 'User',
      department: '',
    });
    setModalVisible(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({
      username: u.username || '',
      email: u.email || '',
      phone: u.phone || '',
      password: '',
      role: u.role || 'User',
      department: u.department?._id || u.department || '',
    });
    setModalVisible(true);
  };

  const handleDelete = (u) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to deactivate user "${u.username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await userService.delete(u._id);
              loadUsersAndDepts();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveUser = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.phone.trim()) {
      return Alert.alert('Validation Error', 'Username, email and phone are required.');
    }
    if (!editingUser && !form.password) {
      return Alert.alert('Validation Error', 'Password is required for new users.');
    }

    try {
      setSubmitting(true);
      const payload = { ...form };
      if (editingUser && !payload.password) delete payload.password;
      if (!payload.department) delete payload.department;

      if (editingUser) {
        await userService.update(editingUser._id, payload);
      } else {
        await userService.create(payload);
      }

      setModalVisible(false);
      loadUsersAndDepts();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={loading || submitting} loadingText={submitting ? 'Saving user...' : 'Loading users...'}>
      <Header
        title="Manage Users"
        subtitle="Create, edit, and manage user accounts"
        rightAction="＋ Add User"
        onRightActionPress={handleOpenAdd}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <Card style={styles.userCard}>
            <View style={styles.userHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>

              <View
                style={[
                  styles.roleChip,
                  item.role === 'SuperAdmin' ? styles.superAdminChip : styles.standardChip,
                ]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    item.role === 'SuperAdmin' ? styles.superAdminText : styles.standardText,
                  ]}
                >
                  {item.role}
                </Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>📞 {item.phone}</Text>
              {item.department ? (
                <Text style={styles.detailText}>
                  🏢 {item.department?.name || 'Department'}
                </Text>
              ) : null}
            </View>

            <View style={styles.actionsRow}>
              <Button
                title="Edit User"
                onPress={() => handleOpenEdit(item)}
                variant="secondary"
                size="small"
                style={styles.actionBtn}
              />
              <Button
                title="Deactivate"
                onPress={() => handleDelete(item)}
                variant="danger"
                size="small"
                style={styles.actionBtn}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && <EmptyState title="No Users Found" message="No user accounts match current system records." />
        }
      />

      {/* Modal Form for Add/Edit User */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Edit User Details' : 'Create New User Account'}
              </Text>

              <Input
                label="Username"
                value={form.username}
                onChangeText={(text) => setForm({ ...form, username: text })}
                placeholder="e.g. johndoe"
                required
              />

              <Input
                label="Email Address"
                value={form.email}
                onChangeText={(text) => setForm({ ...form, email: text })}
                placeholder="john@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Input
                label="Phone Number"
                value={form.phone}
                onChangeText={(text) => setForm({ ...form, phone: text })}
                placeholder="+1234567890"
                keyboardType="phone-pad"
                required
              />

              <Input
                label={editingUser ? 'New Password (Optional)' : 'Password'}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Enter password'}
                secureTextEntry
                required={!editingUser}
              />

              <Select
                label="Assigned Role"
                value={form.role}
                onValueChange={(val) => setForm({ ...form, role: val })}
                options={USER_ROLES.map((r) => ({ label: r, value: r }))}
                required
              />

              <Select
                label="Department (Optional)"
                value={form.department}
                onValueChange={(val) => setForm({ ...form, department: val })}
                options={departments}
                placeholder="-- None --"
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="secondary"
                  style={styles.modalBtn}
                />
                <Button
                  title={editingUser ? 'Save Changes' : 'Create User'}
                  onPress={handleSaveUser}
                  loading={submitting}
                  style={styles.modalBtn}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: SPACING.md,
  },
  errorBox: {
    margin: SPACING.md,
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
  userCard: {
    marginBottom: SPACING.md,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  username: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
  },
  superAdminChip: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  standardChip: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.border,
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  superAdminText: {
    color: COLORS.primary,
  },
  standardText: {
    color: COLORS.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginVertical: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 6,
  },
  actionBtn: {
    minWidth: 90,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '90%',
  },
  modalScroll: {
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
  },
});
