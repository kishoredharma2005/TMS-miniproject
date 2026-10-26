import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { roleService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { showConfirm, showAlert } from '../../utils/alertHelper';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageRolesScreen = ({ navigation }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionsStr, setPermissionsStr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRoles = useCallback(async () => {
    try {
      setError('');
      const data = await roleService.getAll();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setRoles(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRoles();
  };

  const handleOpenAdd = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setPermissionsStr('');
    setModalVisible(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setName(role.name || '');
    setDescription(role.description || '');
    setPermissionsStr(Array.isArray(role.permissions) ? role.permissions.join(', ') : '');
    setModalVisible(true);
  };

  const handleDelete = (role) => {
    showConfirm(
      'Delete Role',
      `Are you sure you want to delete role "${role.name}"?`,
      async () => {
        try {
          setLoading(true);
          await roleService.delete(role._id);
          loadRoles();
        } catch (err) {
          showAlert('Error', getErrorMessage(err));
          setLoading(false);
        }
      },
      'Delete'
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      return showAlert('Validation Error', 'Role name is required.');
    }

    try {
      setSubmitting(true);
      const permissions = permissionsStr
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissions,
      };

      if (editingRole) {
        await roleService.update(editingRole._id, payload);
      } else {
        await roleService.create(payload);
      }

      setModalVisible(false);
      loadRoles();
    } catch (err) {
      showAlert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={loading} loadingText="Loading roles...">
      <Header
        title="Manage Roles"
        subtitle="User access levels and authorization policies"
        rightAction="＋ Add"
        onRightActionPress={handleOpenAdd}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={roles}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          !loading && (
            <EmptyState
              title="No Custom Roles"
              message="Tap '＋ Add' at the top right to define system roles and permission sets."
            />
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.roleCard}>
            <View style={styles.roleHeader}>
              <Text style={styles.roleName}>{item.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {item.permissions?.length || 0} permissions
                </Text>
              </View>
            </View>

            {item.description ? (
              <Text style={styles.roleDesc}>{item.description}</Text>
            ) : null}

            {item.permissions && item.permissions.length > 0 ? (
              <View style={styles.permissionsWrap}>
                {item.permissions.map((perm, idx) => (
                  <View key={idx} style={styles.permChip}>
                    <Text style={styles.permText}>{perm}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actionsRow}>
              <Button
                title="Edit"
                onPress={() => handleOpenEdit(item)}
                variant="secondary"
                size="small"
                style={styles.actionBtn}
              />
              <Button
                title="Delete"
                onPress={() => handleDelete(item)}
                variant="danger"
                size="small"
                style={styles.actionBtn}
              />
            </View>
          </Card>
        )}
      />

      {/* Add / Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.modalTitle}>
                {editingRole ? 'Edit System Role' : 'Create System Role'}
              </Text>

              <Input
                label="Role Title"
                placeholder="e.g. Lab Technician"
                value={name}
                onChangeText={setName}
                required
              />

              <Input
                label="Description (Optional)"
                placeholder="Scope of responsibility"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={2}
              />

              <Input
                label="Permissions (Comma separated)"
                placeholder="e.g. read:tickets, update:status, assign:work"
                value={permissionsStr}
                onChangeText={setPermissionsStr}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalBtnRow}>
                <Button
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
                  variant="secondary"
                  style={styles.modalBtn}
                />
                <Button
                  title={editingRole ? 'Save Changes' : 'Create Role'}
                  onPress={handleSave}
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
    backgroundColor: COLORS.dangerBg,
    borderColor: COLORS.dangerBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
  roleCard: {
    marginBottom: SPACING.sm,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: 'rgba(168, 85, 247, 0.4)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '700',
  },
  roleDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 6,
    lineHeight: 18,
  },
  permissionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  permChip: {
    backgroundColor: COLORS.surfaceHighlight,
    borderRadius: RADIUS.xs,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  permText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    marginLeft: SPACING.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalScroll: {
    padding: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});
