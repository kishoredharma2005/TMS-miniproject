import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { COMPLAINT_STATUSES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ViewAllTicketsScreen = ({ navigation, route }) => {
  const initialFilter = route.params?.filter || 'All';

  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Assign Technician Modal
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Status Change Modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [ticketRes, userRes] = await Promise.all([
        ticketService.getAll(),
        userService.getAll().catch(() => []),
      ]);

      const tList = Array.isArray(ticketRes) ? ticketRes : (ticketRes?.data || []);
      const uList = Array.isArray(userRes) ? userRes : (userRes?.data || []);

      setTickets(tList);
      setUsers(uList);
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

  const handleOpenAssign = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedAssignee(ticket.assignedTo?._id || ticket.assignedTo || '');
    setAssignModalVisible(true);
  };

  const handleOpenStatus = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status || 'Pending');
    setStatusModalVisible(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedAssignee) {
      return Alert.alert('Validation Error', 'Please select a technician staff member.');
    }
    try {
      setSubmitting(true);
      await ticketService.assign(selectedTicket._id, selectedAssignee);
      setAssignModalVisible(false);
      Alert.alert('Success', 'Technician assigned successfully.');
      loadData();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusSubmit = async () => {
    if (!newStatus) return;
    try {
      setSubmitting(true);
      await ticketService.updateStatus(selectedTicket._id, newStatus);
      setStatusModalVisible(false);
      Alert.alert('Success', `Status updated to ${newStatus}`);
      loadData();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (t.complaintType && t.complaintType.toLowerCase().includes(query)) ||
      (t.blockName && t.blockName.toLowerCase().includes(query)) ||
      (t.roomNumber && t.roomNumber.toLowerCase().includes(query)) ||
      (t.remarks && t.remarks.toLowerCase().includes(query)) ||
      (t.createdBy?.username && t.createdBy.username.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const staffUsers = users.filter((u) => u.role !== 'SuperAdmin');
  const filterTabs = ['All', ...COMPLAINT_STATUSES];

  return (
    <ScreenWrapper loading={loading || submitting} loadingText={submitting ? 'Updating...' : 'Loading all complaints...'}>
      <Header title="All Tickets" subtitle="Global system complaint management" />

      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search tickets by user, block, room..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <FlatList
          horizontal
          data={filterTabs}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          renderItem={({ item }) => {
            const isActive = filterStatus === item;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.activeTabChip]}
                onPress={() => setFilterStatus(item)}
              >
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <FlatList
        data={filteredTickets}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <Card onPress={() => navigation.navigate('TicketDetails', { ticketId: item._id, ticket: item })}>
            <View style={styles.ticketHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ticketType}>{item.complaintType}</Text>
                <Text style={styles.ticketLocation}>
                  📍 {item.blockName} • Room {item.roomNumber}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            {item.remarks ? (
              <Text style={styles.ticketRemarks} numberOfLines={2}>
                {item.remarks}
              </Text>
            ) : null}

            <View style={styles.reporterBox}>
              <Text style={styles.reporterText}>
                👤 Raised by: {item.createdBy?.username || item.createdBy?.email || 'User'}
              </Text>
              {item.assignedTo ? (
                <Text style={styles.assigneeText}>
                  🛠️ Assigned: {item.assignedTo.username || item.assignedTo.email} ({item.assignedTo.role || 'Staff'})
                </Text>
              ) : (
                <Text style={styles.unassignedText}>⚠️ Unassigned</Text>
              )}
            </View>

            <View style={styles.actionsRow}>
              <Button
                title="🛠️ Assign"
                onPress={() => handleOpenAssign(item)}
                variant="secondary"
                size="small"
                style={styles.actionBtn}
              />
              <Button
                title="⚙️ Status"
                onPress={() => handleOpenStatus(item)}
                variant="outline"
                size="small"
                style={styles.actionBtn}
              />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && <EmptyState title="No Tickets Found" message={`No complaints found for status "${filterStatus}".`} />
        }
      />

      {/* Assign Technician Modal */}
      <Modal visible={assignModalVisible} animationType="slide" transparent onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Assign Technician Staff</Text>
            <Text style={styles.modalSub}>
              Ticket: {selectedTicket?.complaintType} ({selectedTicket?.blockName} - Room {selectedTicket?.roomNumber})
            </Text>

            <Select
              label="Select Assignee Staff Member"
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
              options={staffUsers.map((u) => ({
                label: `${u.username} (${u.role})`,
                value: u._id,
              }))}
              placeholder="-- Select Staff User --"
              required
            />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" onPress={() => setAssignModalVisible(false)} variant="secondary" style={styles.modalBtn} />
              <Button title="Assign Ticket" onPress={handleAssignSubmit} loading={submitting} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Status Change Modal */}
      <Modal visible={statusModalVisible} animationType="slide" transparent onRequestClose={() => setStatusModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Update Ticket Status</Text>

            <Select
              label="Select New Status"
              value={newStatus}
              onValueChange={setNewStatus}
              options={COMPLAINT_STATUSES.map((s) => ({ label: s, value: s }))}
              required
            />

            <View style={styles.modalBtnRow}>
              <Button title="Cancel" onPress={() => setStatusModalVisible(false)} variant="secondary" style={styles.modalBtn} />
              <Button title="Save Status" onPress={handleStatusSubmit} loading={submitting} style={styles.modalBtn} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  filterSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  tabsContainer: {
    paddingRight: SPACING.md,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  activeTabChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
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
  listContainer: {
    padding: SPACING.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketType: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  ticketLocation: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ticketRemarks: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 8,
    lineHeight: 18,
  },
  reporterBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginBottom: 8,
  },
  reporterText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  assigneeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  unassignedText: {
    fontSize: 12,
    color: COLORS.warning,
    fontWeight: '500',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
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
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
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
