import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { departmentService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageDepartmentsScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDepartments = useCallback(async () => {
    try {
      setError('');
      const data = await departmentService.getAll();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setDepartments(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDepartments();
  };

  const handleOpenAdd = () => {
    setEditingDept(null);
    setName('');
    setShortName('');
    setDescription('');
    setModalVisible(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name || '');
    setShortName(dept.shortName || '');
    setDescription(dept.description || '');
    setModalVisible(true);
  };

  const handleDelete = (dept) => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete "${dept.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await departmentService.delete(dept._id);
              loadDepartments();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !shortName.trim()) {
      return Alert.alert('Validation Error', 'Department name and short name are required.');
    }

    try {
      setSubmitting(true);
      const payload = { name: name.trim(), shortName: shortName.trim().toUpperCase(), description: description.trim() };
      if (editingDept) {
        await departmentService.update(editingDept._id, payload);
      } else {
        await departmentService.create(payload);
      }

      setModalVisible(false);
      loadDepartments();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={loading || submitting} loadingText={submitting ? 'Saving department...' : 'Loading departments...'}>
      <Header
        title="Departments"
        subtitle="Manage academic & administrative departments"
        rightAction="＋ Add"
        onRightActionPress={handleOpenAdd}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={departments}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.shortName}>Code: {item.shortName}</Text>
              </View>
            </View>

            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}

            <View style={styles.actionsRow}>
              <Button
                title="Edit"
                onPress={() => handleOpenEdit(item)}
                variant="secondary"
                size="small"
                style={styles.btn}
              />
              <Button
                title="Delete"
                onPress={() => handleDelete(item)}
                variant="danger"
                size="small"
                style={styles.btn}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && <EmptyState title="No Departments Found" message="Add departments to categorize issues." />
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingDept ? 'Edit Department' : 'Create New Department'}
            </Text>

            <Input
              label="Department Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Computer Science"
              required
            />

            <Input
              label="Short Code (2-8 Chars)"
              value={shortName}
              onChangeText={setShortName}
              placeholder="e.g. CSE"
              autoCapitalize="characters"
              required
            />

            <Input
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter brief description..."
              multiline
              numberOfLines={2}
            />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" style={styles.modalBtn} />
              <Button title={editingDept ? 'Save' : 'Create'} onPress={handleSave} loading={submitting} style={styles.modalBtn} />
            </View>
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
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  shortName: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 8,
  },
  btn: {
    minWidth: 80,
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
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
