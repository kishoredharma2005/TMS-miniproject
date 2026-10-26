import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { TECHNICIAN_ROLES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ManageTechniciansScreen = ({ navigation }) => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedRole, setSelectedRole] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTechnicians = useCallback(async () => {
    try {
      setError('');
      const data = await userService.getAll();
      const allUsers = Array.isArray(data) ? data : (data?.data || []);
      const techList = allUsers.filter((u) => u.role !== 'SuperAdmin' && u.role !== 'User');
      setTechnicians(techList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTechnicians();
  }, [loadTechnicians]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTechnicians();
  };

  const filteredTechnicians = technicians.filter((t) => {
    return selectedRole === 'All' || t.role === selectedRole;
  });

  const roleFilterTabs = ['All', ...TECHNICIAN_ROLES];

  return (
    <ScreenWrapper loading={loading} loadingText="Loading technician staff...">
      <Header
        title="Manage Technicians"
        subtitle="Staff members & assigned specializations"
        rightAction="＋ Add User"
        onRightActionPress={() => navigation.navigate('ManageUsers')}
      />

      {/* Role Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={roleFilterTabs}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
          renderItem={({ item }) => {
            const isActive = selectedRole === item;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isActive && styles.activeTabChip]}
                onPress={() => setSelectedRole(item)}
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
        data={filteredTechnicians}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nameText}>👤 {item.username}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.role}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>📞 Phone: {item.phone}</Text>
              <Text style={styles.infoText}>
                🏢 Dept: {item.department?.name || 'General Maintenance'}
              </Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              title="No Technicians Found"
              message={`No staff members found with role "${selectedRole}".`}
              actionTitle="Add New Technician User"
              onAction={() => navigation.navigate('ManageUsers')}
            />
          )
        }
      />
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
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple,
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
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  emailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: COLORS.purpleBg,
    borderColor: COLORS.purple,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.pill,
  },
  badgeText: {
    color: COLORS.purple,
    fontSize: 11,
    fontWeight: '700',
  },
  infoRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
