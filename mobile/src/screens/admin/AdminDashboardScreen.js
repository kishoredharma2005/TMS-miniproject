import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { StatCard } from '../../components/StatCard';
import { Card } from '../../components/Card';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const AdminDashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setError('');
      const [statsData, users] = await Promise.all([
        ticketService.getStats().catch(() => null),
        userService.getAll().catch(() => []),
      ]);

      if (statsData) {
        setStats(statsData);
      }
      setUserCount(Array.isArray(users) ? users.length : 0);
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

  const adminNavButtons = [
    { title: '🎫 View All Tickets', screen: 'ViewAllTickets', color: COLORS.primary },
    { title: '👥 Manage Users', screen: 'ManageUsers', color: COLORS.accent },
    { title: '🛠️ Manage Technicians', screen: 'ManageTechnicians', color: COLORS.purple },
    { title: '🏛️ Departments', screen: 'ManageDepartments', color: COLORS.info },
    { title: '🎓 Academic Programmes', screen: 'ManageProgrammes', color: COLORS.primary },
    { title: '🏢 Campus Blocks', screen: 'ManageBlocks', color: COLORS.warning },
    { title: '🚪 Rooms', screen: 'ManageRooms', color: COLORS.secondary },
    { title: '🛡️ Roles & Permissions', screen: 'ManageRoles', color: COLORS.danger },
    { title: '📊 System Reports', screen: 'Reports', color: COLORS.success },
  ];

  return (
    <ScreenWrapper loading={loading} loadingText="Loading SuperAdmin dashboard...">
      <Header
        title="Admin Control Center"
        subtitle="SuperAdmin System Overview"
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

        {/* Global Statistics Grid */}
        <Text style={styles.sectionTitle}>System Statistics</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Complaints"
            value={stats.total}
            color={COLORS.primary}
            onPress={() => navigation.navigate('ViewAllTickets', { filter: 'All' })}
          />
          <StatCard
            label="Pending Action"
            value={stats.pending}
            color={COLORS.warning}
            onPress={() => navigation.navigate('ViewAllTickets', { filter: 'Pending' })}
          />
          <StatCard
            label="Currently Assigned"
            value={stats.assigned}
            color={COLORS.info}
            onPress={() => navigation.navigate('ViewAllTickets', { filter: 'Assigned' })}
          />
          <StatCard
            label="Closed Tickets"
            value={stats.closed}
            color={COLORS.success}
            onPress={() => navigation.navigate('ViewAllTickets', { filter: 'Closed' })}
          />
        </View>

        {/* System Administration Shortcuts */}
        <Text style={styles.sectionTitle}>Master Administration & Tools</Text>
        <View style={styles.menuGrid}>
          {adminNavButtons.map((btn) => (
            <TouchableOpacity
              key={btn.screen}
              style={[styles.menuCard, { borderLeftColor: btn.color }]}
              onPress={() => navigation.navigate(btn.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuText}>{btn.title}</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick System Status Card */}
        <Card style={styles.statusCard}>
          <Text style={styles.statusTitle}>Registered System Users</Text>
          <Text style={styles.statusValue}>{userCount} Active Accounts</Text>
          <Text style={styles.statusDesc}>
            SuperAdmins have full privileges to assign technicians, alter complaint statuses, manage master databases, and generate custom system reports.
          </Text>
        </Card>
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  menuGrid: {
    marginBottom: SPACING.md,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  arrowIcon: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  statusCard: {
    marginTop: SPACING.xs,
  },
  statusTitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginVertical: 4,
  },
  statusDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
});
