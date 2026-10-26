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
import { programmeService, departmentService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { showConfirm, showAlert } from '../../utils/alertHelper';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageProgrammesScreen = ({ navigation }) => {
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll().catch(() => []),
      ]);

      const pList = Array.isArray(progRes) ? progRes : (progRes?.data || []);
      const dList = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);

      setProgrammes(pList);
      setDepartments(dList.map((d) => ({ label: d.name, value: d._id })));
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
    setEditingProg(null);
    setName('');
    setShortName('');
    setDepartmentId(departments[0]?.value || '');
    setDescription('');
    setModalVisible(true);
  };

  const handleOpenEdit = (prog) => {
    setEditingProg(prog);
    setName(prog.name || '');
    setShortName(prog.shortName || '');
    setDepartmentId(prog.department?._id || prog.department || '');
    setDescription(prog.description || '');
    setModalVisible(true);
  };

  const handleDelete = (prog) => {
    showConfirm(
      'Delete Programme',
      `Are you sure you want to delete programme "${prog.name}"?`,
      async () => {
        try {
          setLoading(true);
          await programmeService.delete(prog._id);
          loadData();
        } catch (err) {
          showAlert('Error', getErrorMessage(err));
          setLoading(false);
        }
      },
      'Delete'
    );
  };

  const handleSave = async () => {
    if (!name.trim() || !shortName.trim()) {
      return showAlert('Validation Error', 'Programme name and short name are required.');
    }
    const cleanShort = shortName.trim().toUpperCase();
    if (cleanShort.length < 2 || cleanShort.length > 8) {
      return showAlert('Validation Error', 'Short Name must be between 2 and 8 characters.');
    }
    if (!departmentId) {
      return showAlert('Validation Error', 'Please select an academic department.');
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        shortName: cleanShort,
        department: departmentId,
        description: description.trim(),
      };

      if (editingProg) {
        await programmeService.update(editingProg._id, payload);
      } else {
        await programmeService.create(payload);
      }

      setModalVisible(false);
      loadData();
    } catch (err) {
      showAlert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={loading} loadingText="Loading programmes...">
      <Header
        title="Manage Programmes"
        subtitle="Degree programs and academic curricula"
        rightAction="＋ Add"
        onRightActionPress={handleOpenAdd}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={programmes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          !loading && (
            <EmptyState
              title="No Programmes Found"
              message="Tap '＋ Add' at the top right to register the first academic programme."
            />
          )
        }
        renderItem={({ item }) => (
          <Card style={styles.progCard}>
            <View style={styles.progHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.progName}>{item.name}</Text>
                <Text style={styles.progDept}>
                  🏛️ {item.department?.name || 'Department'}
                </Text>
              </View>
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>{item.shortName}</Text>
              </View>
            </View>

            {item.description ? (
              <Text style={styles.progDesc} numberOfLines={2}>
                {item.description}
              </Text>
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
                {editingProg ? 'Edit Academic Programme' : 'Add New Programme'}
              </Text>

              <Input
                label="Programme Name"
                placeholder="e.g. B.Tech Computer Science"
                value={name}
                onChangeText={setName}
                required
              />

              <Input
                label="Short Code (2-8 chars)"
                placeholder="e.g. BT-CSE"
                value={shortName}
                onChangeText={setShortName}
                autoCapitalize="characters"
                required
              />

              <Select
                label="Department"
                value={departmentId}
                onValueChange={setDepartmentId}
                options={departments}
                placeholder="Select Department"
                required
              />

              <Input
                label="Description (Optional)"
                placeholder="Curriculum notes or specialization"
                value={description}
                onChangeText={setDescription}
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
                  title={editingProg ? 'Save Changes' : 'Create Programme'}
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
  progCard: {
    marginBottom: SPACING.sm,
  },
  progHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  progName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  progDept: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  codeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  codeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  progDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginVertical: 4,
    lineHeight: 16,
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
