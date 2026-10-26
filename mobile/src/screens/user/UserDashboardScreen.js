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
import { Button } from '../../components/Button';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const UserDashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    try {
      setError('');
      const [statsData, allComplaints] = await Promise.all([
        ticketService.getStats().catch(() => null),
        ticketService.getAll().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      } else {
        // Fallback local stat filter
        const total = allComplaints.length;
        const pending = allComplaints.filter((c) => c.status === 'Pending').length;
        const assigned = allComplaints.filter((c) => c.status === 'Assigned').length;
        const closed = allComplaints.filter((c) => c.status === 'Closed').length;
        setStats({ total, pending, assigned, closed });
      }

      setRecentTickets(allComplaints.slice(0, 5));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  return (
    <ScreenWrapper loading={loading} loadingText="Loading dashboard...">
      <Header
        title="User Dashboard"
        subtitle={`Welcome back, ${user?.username || 'User'}`}
        rightAction="New Ticket"
        onRightActionPress={() => navigation.navigate('CreateTicket')}
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

        {/* User Greeting Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerTitle}>Need assistance or support?</Text>
          <Text style={styles.bannerDesc}>
            Submit a complaint ticket for IT, plumbing, software, or facilities issues.
          </Text>
          <Button
            title="＋ Raise New Complaint"
            onPress={() => navigation.navigate('CreateTicket')}
            style={styles.bannerBtn}
          />
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Raised"
            value={stats.total}
            color={COLORS.primary}
            onPress={() => navigation.navigate('MyTickets', { filter: 'All' })}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color={COLORS.warning}
            onPress={() => navigation.navigate('MyTickets', { filter: 'Pending' })}
          />
          <StatCard
            label="Assigned"
            value={stats.assigned}
            color={COLORS.info}
            onPress={() => navigation.navigate('MyTickets', { filter: 'Assigned' })}
          />
          <StatCard
            label="Closed"
            value={stats.closed}
            color={COLORS.success}
            onPress={() => navigation.navigate('MyTickets', { filter: 'Closed' })}
          />
        </View>

        {/* Recent Tickets Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        {recentTickets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No complaints raised yet.</Text>
          </Card>
        ) : (
          recentTickets.map((ticket) => (
            <Card
              key={ticket._id}
              onPress={() => navigation.navigate('TicketDetails', { ticketId: ticket._id, ticket })}
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
                <Text style={styles.detailsBtnText}>Details →</Text>
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
  bannerCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  bannerDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginBottom: 12,
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
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
