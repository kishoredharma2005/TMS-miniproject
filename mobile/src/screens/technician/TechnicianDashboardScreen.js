import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { getErrorMessage } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { Card } from '../../components/Card';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const TechnicianDashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [assignedTickets, setAssignedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [statsData, complaints] = await Promise.all([
        ticketService.getStats().catch(() => null),
        ticketService.getAll().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        const total = complaints.length;
        const pending = complaints.filter((c) => c.status === 'Pending').length;
        const assigned = complaints.filter((c) => c.status === 'Assigned').length;
        const closed = complaints.filter((c) => c.status === 'Closed').length;
        setStats({ total, pending, assigned, closed });
      }

      setAssignedTickets(complaints.slice(0, 5));
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

  return (
    <ScreenWrapper loading={loading} loadingText="Loading technician overview...">
      <Header
        title="Technician Portal"
        subtitle={`Role: ${user?.role || 'Staff'}`}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Welcome Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Assigned Complaints Dashboard</Text>
          <Text style={styles.headerDesc}>
            Manage complaint tickets assigned to your department ({user?.department?.name || 'Department'}).
          </Text>
        </View>

        {/* Stats */}
        <Text style={styles.sectionTitle}>Work Queue Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Queue"
            value={stats.total}
            color={COLORS.primary}
            onPress={() => navigation.navigate('AssignedTickets', { filter: 'All' })}
          />
          <StatCard
            label="Assigned"
            value={stats.assigned}
            color={COLORS.info}
            onPress={() => navigation.navigate('AssignedTickets', { filter: 'Assigned' })}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color={COLORS.warning}
            onPress={() => navigation.navigate('AssignedTickets', { filter: 'Pending' })}
          />
          <StatCard
            label="Completed"
            value={stats.closed}
            color={COLORS.success}
            onPress={() => navigation.navigate('AssignedTickets', { filter: 'Closed' })}
          />
        </View>

        {/* Quick List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Assigned Work</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AssignedTickets')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {assignedTickets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No assigned tickets in queue.</Text>
          </Card>
        ) : (
          assignedTickets.map((ticket) => (
            <Card
              key={ticket._id}
              onPress={() =>
                navigation.navigate('TechnicianTicketDetails', { ticketId: ticket._id, ticket })
              }
            >
              <View style={styles.ticketHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.ticketType}>{ticket.complaintType}</Text>
                  <Text style={styles.ticketLocation}>
                    📍 {ticket.blockName} • Room {ticket.roomNumber}
                  </Text>
                </View>
                <StatusBadge status={ticket.status} />
              </View>

              {ticket.remarks ? (
                <Text style={styles.ticketRemarks} numberOfLines={2}>
                  {ticket.remarks}
                </Text>
              ) : null}

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketDate}>
                  📅 {new Date(ticket.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.actionText}>Update Status →</Text>
              </View>
            </Card>
          ))
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
  headerCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  emptyCard: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 14,
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
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 4,
  },
  ticketDate: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
