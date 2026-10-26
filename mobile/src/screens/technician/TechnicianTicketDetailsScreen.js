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

export const TechnicianTicketDetailsScreen = ({ route, navigation }) => {
  const { user } = useContext(AuthContext);
  const initialTicket = route.params?.ticket;
  const ticketId = route.params?.ticketId || initialTicket?._id;

  const [ticket, setTicket] = useState(initialTicket);
  const [loading, setLoading] = useState(!initialTicket);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(initialTicket?.status || 'In-Progress');

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
        setStatus(found.status);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    const targetStatus = newStatus || status;
    if (!targetStatus) return;
    try {
      setUpdating(true);
      setError('');
      await ticketService.updateStatus(ticketId, targetStatus);
      Alert.alert('Success', `Status changed to "${targetStatus}"`);
      fetchTicketDetails();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  const baseUrl = getApiBaseUrl().replace('/api', '');
  const attachmentUrl = ticket?.attachment
    ? (ticket.attachment.startsWith('http') ? ticket.attachment : `${baseUrl}${ticket.attachment}`)
    : null;

  return (
    <ScreenWrapper loading={loading || updating} loadingText={updating ? 'Updating status...' : 'Loading ticket details...'}>
      <Header
        title="Work Order Details"
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
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.ticketType}>{ticket.complaintType}</Text>
                <StatusBadge status={ticket.status} />
              </View>

              <View style={styles.grid}>
                <View style={styles.gridItem}>
                  <Text style={styles.label}>Location Block</Text>
                  <Text style={styles.value}>{ticket.blockName || '-'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Room Number</Text>
                  <Text style={styles.value}>{ticket.roomNumber || '-'}</Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Reported By</Text>
                  <Text style={styles.value}>
                    {ticket.createdBy?.username || ticket.createdBy?.email || 'User'}
                  </Text>
                </View>

                <View style={styles.gridItem}>
                  <Text style={styles.label}>Logged Date</Text>
                  <Text style={styles.value}>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Issue Description / Remarks</Text>
              <View style={styles.remarksBox}>
                <Text style={styles.remarksText}>{ticket.remarks || 'No remarks supplied.'}</Text>
              </View>

              {attachmentUrl ? (
                <View style={styles.attachmentSection}>
                  <Text style={styles.sectionHeader}>Attachment File</Text>
                  <TouchableOpacity
                    style={styles.attachmentBtn}
                    onPress={() => Linking.openURL(attachmentUrl)}
                  >
                    <Text style={styles.attachmentText}>📎 View Attachment File</Text>
                  </TouchableOpacity>

                  {attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <Image source={{ uri: attachmentUrl }} style={styles.attachmentImage} />
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Quick Status Control Panel */}
            <View style={styles.actionCard}>
              <Text style={styles.sectionHeader}>Technician Action Panel</Text>

              <Select
                label="Select New Work Status"
                value={status}
                onValueChange={setStatus}
                options={[
                  { label: 'In-Progress (Started work)', value: 'In-Progress' },
                  { label: 'On Hold (Pending parts/info)', value: 'Onhold' },
                  { label: 'Closed / Completed (Resolved)', value: 'Closed' },
                ]}
              />

              <Button
                title="Update Work Status"
                onPress={() => handleUpdateStatus(status)}
                loading={updating}
                style={styles.actionBtn}
              />

              <View style={styles.quickBtnsRow}>
                <Button
                  title="⚡ Mark In-Progress"
                  onPress={() => handleUpdateStatus('In-Progress')}
                  variant="secondary"
                  size="small"
                  style={styles.quickBtn}
                />
                <Button
                  title="✅ Mark Completed"
                  onPress={() => handleUpdateStatus('Closed')}
                  variant="primary"
                  size="small"
                  style={styles.quickBtn}
                />
              </View>
            </View>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },
  ticketType: {
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
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xs,
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
    marginTop: SPACING.xs,
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
    height: 200,
    borderRadius: RADIUS.md,
    marginTop: 6,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtn: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  quickBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickBtn: {
    width: '48%',
  },
  notFoundText: {
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: SPACING.xl,
    fontSize: 16,
  },
});
