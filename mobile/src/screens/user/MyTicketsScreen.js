import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { getErrorMessage } from '../../services/api';
import { COMPLAINT_STATUSES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const MyTicketsScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const initialFilter = route.params?.filter || 'All';

  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      setError('');
      const data = await ticketService.getAll();
      const all = Array.isArray(data) ? data : (data?.data || []);

      // Filter tickets for current user if backend returned everything
      const userId = user?.id || user?._id;
      const userTickets = all.filter((c) => {
        const createdById = c.createdBy?._id || c.createdBy;
        const assignedToId = c.assignedTo?._id || c.assignedTo;
        return (
          String(createdById) === String(userId) ||
          String(assignedToId) === String(userId) ||
          user?.role === 'SuperAdmin'
        );
      });

      setTickets(userTickets);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTickets();
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (t.complaintType && t.complaintType.toLowerCase().includes(query)) ||
      (t.blockName && t.blockName.toLowerCase().includes(query)) ||
      (t.roomNumber && t.roomNumber.toLowerCase().includes(query)) ||
      (t.remarks && t.remarks.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const filterTabs = ['All', ...COMPLAINT_STATUSES];

  return (
    <ScreenWrapper loading={loading} loadingText="Loading complaints list...">
      <Header
        title="My Complaints"
        subtitle="Manage and track your reported issues"
        rightAction="＋ New"
        onRightActionPress={() => navigation.navigate('CreateTicket')}
      />

      {/* Search & Filter Bar */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search by block, room, or issue type..."
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
                  🏢 {item.blockName} • Room {item.roomNumber}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            {item.remarks ? (
              <Text style={styles.ticketRemarks} numberOfLines={2}>
                {item.remarks}
              </Text>
            ) : null}

            {item.assignedTo ? (
              <Text style={styles.assigneeText}>
                👤 Assigned to: {item.assignedTo.username || item.assignedTo.email || 'Technician'}
              </Text>
            ) : null}

            <View style={styles.ticketFooter}>
              <Text style={styles.ticketDate}>
                📅 {new Date(item.createdAt).toLocaleDateString()}{' '}
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Text style={styles.viewDetailsText}>View Details →</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              title="No Tickets Found"
              message={
                filterStatus === 'All'
                  ? "You haven't submitted any complaints yet."
                  : `No complaints found with status "${filterStatus}".`
              }
              actionTitle="Raise New Ticket"
              onAction={() => navigation.navigate('CreateTicket')}
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
  assigneeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 8,
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
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
