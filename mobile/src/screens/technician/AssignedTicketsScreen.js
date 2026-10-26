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

export const AssignedTicketsScreen = ({ navigation, route }) => {
  const { user } = useContext(AuthContext);
  const initialFilter = route.params?.filter || 'All';

  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAssignedTickets = useCallback(async () => {
    try {
      setError('');
      const data = await ticketService.getAll();
      const list = Array.isArray(data) ? data : (data?.data || []);
      setTickets(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAssignedTickets();
  }, [loadAssignedTickets]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAssignedTickets();
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
    <ScreenWrapper loading={loading} loadingText="Loading assigned tickets...">
      <Header
        title="Assigned Tickets"
        subtitle={`Role: ${user?.role || 'Technician'}`}
      />

      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search block, room, or issue..."
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
          <Card
            onPress={() =>
              navigation.navigate('TechnicianTicketDetails', { ticketId: item._id, ticket: item })
            }
          >
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

            <View style={styles.ticketFooter}>
              <Text style={styles.ticketDate}>
                👤 {item.createdBy?.username || 'User'} • {new Date(item.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.updateText}>Update Status →</Text>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading && (
            <EmptyState
              title="No Assigned Tickets"
              message={`No tickets found with status "${filterStatus}".`}
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
  updateText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
