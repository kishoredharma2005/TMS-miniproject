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
import { blockService, departmentService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageBlocksScreen = ({ navigation }) => {
  const [blocks, setBlocks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [blockRes, deptRes] = await Promise.all([
        blockService.getAll(),
        departmentService.getAll().catch(() => []),
      ]);

      const bList = Array.isArray(blockRes) ? blockRes : (blockRes?.data || []);
      const dList = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);

      setBlocks(bList);
      setDepartments(dList.map(d => ({ label: d.name, value: d._id })));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenAdd = () => {
    setEditingBlock(null);
    setName('');
    setDepartmentId('');
    setModalVisible(true);
  };

  const handleOpenEdit = (block) => {
    setEditingBlock(block);
    setName(block.name || '');
    setDepartmentId(block.department?._id || block.department || '');
    setModalVisible(true);
  };

  const handleDelete = (block) => {
    Alert.alert(
      'Delete Block',
      `Are you sure you want to delete "${block.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await blockService.delete(block._id);
              loadData();
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
    if (!name.trim()) {
      return Alert.alert('Validation Error', 'Block name is required.');
    }

    try {
      setSubmitting(true);
      const payload = { name: name.trim() };
      if (departmentId) payload.department = departmentId;

      if (editingBlock) {
        await blockService.update(editingBlock._id, payload);
      } else {
        await blockService.create(payload);
      }

      setModalVisible(false);
      loadData();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={loading || submitting} loadingText={submitting ? 'Saving block...' : 'Loading blocks...'}>
      <Header
        title="Campus Blocks"
        subtitle="Manage building blocks & locations"
        rightAction="＋ Add"
        onRightActionPress={handleOpenAdd}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={blocks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>🏢 {item.name}</Text>
                {item.department ? (
                  <Text style={styles.deptText}>
                    Department: {item.department.name || item.department}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Button title="Edit" onPress={() => handleOpenEdit(item)} variant="secondary" size="small" style={styles.btn} />
              <Button title="Delete" onPress={() => handleDelete(item)} variant="danger" size="small" style={styles.btn} />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && <EmptyState title="No Campus Blocks" message="Add block locations to system." />
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingBlock ? 'Edit Block' : 'Create New Block'}
            </Text>

            <Input
              label="Block Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Block A, Main Tech Park"
              required
            />

            <Select
              label="Associated Department (Optional)"
              value={departmentId}
              onValueChange={setDepartmentId}
              options={departments}
              placeholder="-- None --"
            />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" style={styles.modalBtn} />
              <Button title={editingBlock ? 'Save' : 'Create'} onPress={handleSave} loading={submitting} style={styles.modalBtn} />
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
  deptText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
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
