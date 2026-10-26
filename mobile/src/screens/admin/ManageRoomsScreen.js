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
import { roomService, blockService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageRoomsScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [blockId, setBlockId] = useState('');
  const [floor, setFloor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [roomRes, blockRes] = await Promise.all([
        roomService.getAll(),
        blockService.getAll().catch(() => []),
      ]);

      const rList = Array.isArray(roomRes) ? roomRes : (roomRes?.data || []);
      const bList = Array.isArray(blockRes) ? blockRes : (blockRes?.data || []);

      setRooms(rList);
      setBlocks(bList.map(b => ({ label: b.name, value: b._id })));
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
    setEditingRoom(null);
    setRoomNumber('');
    setBlockId('');
    setFloor('');
    setModalVisible(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setRoomNumber(room.roomNumber || '');
    setBlockId(room.block?._id || room.block || '');
    setFloor(room.floor ? String(room.floor) : '');
    setModalVisible(true);
  };

  const handleDelete = (room) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete room "${room.roomNumber}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await roomService.delete(room._id);
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
    if (!roomNumber.trim()) {
      return Alert.alert('Validation Error', 'Room number is required.');
    }

    try {
      setSubmitting(true);
      const payload = { roomNumber: roomNumber.trim() };
      if (blockId) payload.block = blockId;
      if (floor) payload.floor = floor;

      if (editingRoom) {
        await roomService.update(editingRoom._id, payload);
      } else {
        await roomService.create(payload);
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
    <ScreenWrapper loading={loading || submitting} loadingText={submitting ? 'Saving room...' : 'Loading rooms...'}>
      <Header
        title="Rooms"
        subtitle="Manage room numbers & laboratory locations"
        rightAction="＋ Add"
        onRightActionPress={handleOpenAdd}
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={rooms}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>🚪 Room {item.roomNumber}</Text>
                <Text style={styles.subText}>
                  Block: {item.block?.name || item.block || 'N/A'} {item.floor ? `• Floor ${item.floor}` : ''}
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Button title="Edit" onPress={() => handleOpenEdit(item)} variant="secondary" size="small" style={styles.btn} />
              <Button title="Delete" onPress={() => handleDelete(item)} variant="danger" size="small" style={styles.btn} />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && <EmptyState title="No Rooms Found" message="Add rooms to assign complaint locations." />
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingRoom ? 'Edit Room' : 'Create New Room'}
            </Text>

            <Input
              label="Room Number / Name"
              value={roomNumber}
              onChangeText={setRoomNumber}
              placeholder="e.g. 101, Lab A"
              required
            />

            <Select
              label="Associated Block"
              value={blockId}
              onValueChange={setBlockId}
              options={blocks}
              placeholder="-- Select Block --"
            />

            <Input
              label="Floor Number (Optional)"
              value={floor}
              onChangeText={setFloor}
              placeholder="e.g. 1, 2, Ground Floor"
            />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="secondary" style={styles.modalBtn} />
              <Button title={editingRoom ? 'Save' : 'Create'} onPress={handleSave} loading={submitting} style={styles.modalBtn} />
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
  subText: {
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
