import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { getErrorMessage, getApiBaseUrl } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { Button } from '../../components/Button';
import { Select } from '../../components/Select';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const TicketDetailsScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const initialTicket = route.params?.ticket;
  const ticketId = route.params?.ticketId || initialTicket?._id;

  const [ticket, setTicket] = useState(initialTicket);
  const [loading, setLoading] = useState(!initialTicket);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(initialTicket?.status || '');

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      setError('');
      let found = null;
      try {
        found = await ticketService.getById(ticketId);
      } catch (e) {
        const data = await ticketService.getAll();
        const list = Array.isArray(data) ? data : (data?.data || []);
        found = list.find((t) => String(t._id) === String(ticketId));
      }
      if (found) {
        setTicket(found);
        setSelectedStatus(found.status);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    try {
      setUpdating(true);
      setError('');
      await ticketService.updateStatus(ticketId, selectedStatus);
      Alert.alert('Status Updated', `Ticket status changed to ${selectedStatus}`);
      fetchTicketDetails();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const isCreator = ticket && (
    String(ticket.createdBy?._id || ticket.createdBy) === String(user?.id || user?._id)
  );
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const canUpdate = isCreator || isSuperAdmin;

  const baseUrl = getApiBaseUrl().replace('/api', '');
  const attachmentUrl = ticket?.attachment
    ? (ticket.attachment.startsWith('http') ? ticket.attachment : `${baseUrl}${ticket.attachment}`)
    : null;

  return (
    <ScreenWrapper loading={loading || updating} loadingText={updating ? 'Updating status...' : 'Loading ticket details...'}>
      <Header
        title="Ticket Details"
        subtitle={`ID: #${ticketId ? ticketId.substring(ticketId.length - 8) : ''}`}
        rightAction="Back"
        onRightActionPress={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.container}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {ticket ? (
          <View>
            <View style={styles.mainCard}>
              <View style={styles.statusRow}>
                <Text style={styles.typeTitle}>{ticket.complaintType}</Text>
                <StatusBadge status={ticket.status} />
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Block</Text>
                  <Text style={styles.value}>{ticket.blockName || '-'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Room Number</Text>
                  <Text style={styles.value}>{ticket.roomNumber || '-'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Date Logged</Text>
                  <Text style={styles.value}>
                    {new Date(ticket.createdAt).toLocaleDateString()}{' '}
                    {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Created By</Text>
                  <Text style={styles.value}>
                    {ticket.createdBy?.username || ticket.createdBy?.email || 'User'}
                  </Text>
                </View>
              </View>

              {ticket.assignedTo ? (
                <View style={styles.assigneeBox}>
                  <Text style={styles.assigneeTitle}>🛠️ Assigned Technician</Text>
                  <Text style={styles.assigneeName}>
                    {ticket.assignedTo.username || ticket.assignedTo.email || 'Technician'} ({ticket.assignedTo.role || 'Staff'})
                  </Text>
                </View>
              ) : (
                <View style={styles.unassignedBox}>
                  <Text style={styles.unassignedText}>⏳ Not yet assigned to a technician</Text>
                </View>
              )}

              <Text style={styles.sectionHeader}>Remarks & Description</Text>
              <View style={styles.remarksBox}>
                <Text style={styles.remarksText}>{ticket.remarks || 'No detailed remarks provided.'}</Text>
              </View>

              {attachmentUrl ? (
                <View style={styles.attachmentSection}>
                  <Text style={styles.sectionHeader}>Attachment</Text>
                  <TouchableOpacity
                    style={styles.attachmentBtn}
                    onPress={() => Linking.openURL(attachmentUrl)}
                  >
                    <Text style={styles.attachmentText}>📎 Open Attachment File / Photo</Text>
                  </TouchableOpacity>

                  {attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <Image source={{ uri: attachmentUrl }} style={styles.attachmentImage} />
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Status Update Card */}
            {canUpdate ? (
              <View style={styles.updateCard}>
                <Text style={styles.sectionHeader}>Update Ticket Status</Text>
                <Select
                  label="Status"
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                  options={[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'Closed / Completed', value: 'Closed' },
                  ]}
                />
                <Button
                  title="Save Status Update"
                  onPress={handleUpdateStatus}
                  loading={updating}
                  style={styles.saveBtn}
                />
              </View>
            ) : null}
          </View>
        ) : (
          <Text style={styles.notFoundText}>Ticket not found.</Text>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
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
  mainCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  typeTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridItem: {
    width: '48%',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  assigneeBox: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 1,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  assigneeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  assigneeName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  unassignedBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  unassignedText: {
    color: COLORS.warning,
    fontSize: 13,
    fontWeight: '500',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  remarksBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  remarksText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  attachmentSection: {
    marginTop: SPACING.sm,
  },
  attachmentBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  attachmentText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  attachmentImage: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.md,
    marginTop: 6,
  },
  updateCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    marginTop: SPACING.xs,
  },
  notFoundText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: SPACING.xl,
    fontSize: 16,
  },
});
