import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { ticketService } from '../../services/ticketService';
import { departmentService } from '../../services/masterService';
import { userService } from '../../services/userService';
import { getErrorMessage } from '../../services/api';
import { COMPLAINT_STATUSES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { EmptyState } from '../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const ReportsScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);

  const [filters, setFilters] = useState({
    department: '',
    status: '',
    assignee: '',
  });

  const [reportResults, setReportResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFilterData = useCallback(async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        departmentService.getAll().catch(() => []),
        userService.getAll().catch(() => []),
      ]);

      const dList = Array.isArray(deptRes) ? deptRes : (deptRes?.data || []);
      const uList = Array.isArray(userRes) ? userRes : (userRes?.data || []);

      setDepartments(dList.map((d) => ({ label: d.name, value: d._id })));
      setUsers(uList.map((u) => ({ label: `${u.username} (${u.role})`, value: u._id })));
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadFilterData();
  }, [loadFilterData]);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (filters.department) params.department = filters.department;
      if (filters.status) params.status = filters.status;
      if (filters.assignee) params.assignee = filters.assignee;

      const data = await ticketService.getReport(params);
      const list = Array.isArray(data) ? data : (data?.data || []);
      setReportResults(list);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({ department: '', status: '', assignee: '' });
    setReportResults([]);
  };

  return (
    <ScreenWrapper loading={loading} loadingText="Generating report...">
      <Header
        title="Reports & Statistics"
        subtitle="Filter and analyze ticket complaints"
      />

      <ScrollView contentContainerStyle={styles.container}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {/* Filter Card */}
        <Card style={styles.filterCard}>
          <Text style={styles.sectionTitle}>Report Filters</Text>

          <Select
            label="Department"
            value={filters.department}
            onValueChange={(val) => setFilters({ ...filters, department: val })}
            options={departments}
            placeholder="All Departments"
          />

          <Select
            label="Complaint Status"
            value={filters.status}
            onValueChange={(val) => setFilters({ ...filters, status: val })}
            options={COMPLAINT_STATUSES.map((s) => ({ label: s, value: s }))}
            placeholder="All Statuses"
          />

          <Select
            label="Assigned Technician / Staff"
            value={filters.assignee}
            onValueChange={(val) => setFilters({ ...filters, assignee: val })}
            options={users}
            placeholder="Any Assignee"
          />

          <View style={styles.btnRow}>
            <Button
              title="Reset"
              onPress={handleResetFilters}
              variant="secondary"
              style={styles.btn}
            />
            <Button
              title="📊 Generate Report"
              onPress={handleGenerateReport}
              loading={loading}
              style={styles.btn}
            />
          </View>
        </Card>

        {/* Report Output Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            Report Summary ({reportResults.length} records found)
          </Text>
        </View>

        {reportResults.length === 0 ? (
          <EmptyState
            title="No Report Data"
            message="Configure filters above and tap 'Generate Report' to produce analytical data."
          />
        ) : (
          reportResults.map((item) => (
            <Card
              key={item._id}
              onPress={() =>
                navigation.navigate('TicketDetails', { ticketId: item._id, ticket: item })
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

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>
                  👤 Created: {item.createdBy?.username || item.createdBy?.email || 'User'}
                </Text>
                <Text style={styles.metaText}>
                  🛠️ Assignee: {item.assignedTo?.username || 'Unassigned'}
                </Text>
              </View>

              <View style={styles.ticketFooter}>
                <Text style={styles.ticketDate}>
                  📅 {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.viewText}>Details →</Text>
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
  filterCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: SPACING.sm,
  },
  btn: {
    flex: 1,
  },
  resultsHeader: {
    marginVertical: SPACING.xs,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
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
  metaRow: {
    backgroundColor: COLORS.surfaceLight,
    padding: 8,
    borderRadius: RADIUS.sm,
    marginVertical: 6,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textMuted,
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
  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
