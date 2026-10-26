import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { departmentService, blockService, roomService } from '../../services/masterService';
import { getErrorMessage } from '../../services/api';
import { COMPLAINT_TYPES } from '../../utils/constants';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { Header } from '../../components/Header';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Button } from '../../components/Button';
import { COLORS, RADIUS, SPACING } from '../../utils/theme';

export const CreateTicketScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [departmentId, setDepartmentId] = useState('');
  const [blockId, setBlockId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [customRoomNumber, setCustomRoomNumber] = useState('');
  const [complaintType, setComplaintType] = useState(COMPLAINT_TYPES[0]);
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState(null);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch departments on mount
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        setLoadingData(true);
        const res = await departmentService.getAll();
        const list = Array.isArray(res) ? res : (res?.data || []);
        setDepartments(list.map(d => ({ label: d.name, value: d._id, name: d.name })));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoadingData(false);
      }
    };
    fetchDepts();
  }, []);

  // 2. Fetch blocks when department changes
  useEffect(() => {
    if (!departmentId) {
      setBlocks([]);
      setBlockId('');
      return;
    }
    const fetchBlocks = async () => {
      try {
        setLoadingData(true);
        const res = await blockService.getAll({ departmentId });
        const list = Array.isArray(res) ? res : (res?.data || []);
        setBlocks(list.map(b => ({ label: b.name, value: b._id, name: b.name })));
      } catch (err) {
        console.log('Failed to load blocks:', err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchBlocks();
    setBlockId('');
    setRoomId('');
    setRooms([]);
  }, [departmentId]);

  // 3. Fetch rooms when block changes
  useEffect(() => {
    if (!blockId) {
      setRooms([]);
      setRoomId('');
      return;
    }
    const fetchRooms = async () => {
      try {
        setLoadingData(true);
        const res = await roomService.getAll({ blockId });
        const list = Array.isArray(res) ? res : (res?.data || []);
        const formatted = list.map(r => ({ label: `Room ${r.roomNumber}`, value: r._id, roomNumber: r.roomNumber }));
        formatted.push({ label: 'Other (Enter manually)', value: '__manual__' });
        setRooms(formatted);
      } catch (err) {
        console.log('Failed to load rooms:', err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchRooms();
    setRoomId('');
  }, [blockId]);

  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Denied', 'Permission to access gallery is required!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAttachment(result.assets[0]);
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!departmentId) return setError('Please select a department.');
    if (!blockId) return setError('Please select a block.');

    const selectedDept = departments.find(d => String(d.value) === String(departmentId));
    const selectedBlock = blocks.find(b => String(b.value) === String(blockId));
    const selectedRoom = rooms.find(r => String(r.value) === String(roomId));

    const finalRoomNumber = roomId === '__manual__' ? customRoomNumber.trim() : (selectedRoom?.roomNumber || customRoomNumber.trim());

    if (!finalRoomNumber) {
      return setError('Please select a room number or type it manually.');
    }

    setSubmitting(true);
    try {
      if (attachment) {
        const formData = new FormData();
        formData.append('departmentName', selectedDept?.name || '');
        formData.append('blockName', selectedBlock?.name || '');
        formData.append('roomNumber', finalRoomNumber);
        formData.append('complaintType', complaintType);
        formData.append('remarks', remarks);
        formData.append('userId', user?.id || user?._id);

        const filename = attachment.uri.split('/').pop() || 'attachment.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        if (Platform.OS === 'web') {
          const fetchRes = await fetch(attachment.uri);
          const blob = await fetchRes.blob();
          formData.append('attachment', blob, filename);
        } else {
          formData.append('attachment', { uri: attachment.uri, name: filename, type });
        }

        await ticketService.create(formData);
      } else {
        await ticketService.create({
          departmentName: selectedDept?.name || '',
          blockName: selectedBlock?.name || '',
          roomNumber: finalRoomNumber,
          complaintType,
          remarks,
          userId: user?.id || user?._id,
        });
      }

      setSuccess('Complaint created successfully!');
      // Clear form
      setDepartmentId('');
      setBlockId('');
      setRoomId('');
      setCustomRoomNumber('');
      setRemarks('');
      setAttachment(null);

      setTimeout(() => {
        navigation.navigate('MyTickets');
      }, 1200);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenWrapper loading={submitting || loadingData} loadingText={submitting ? 'Submitting complaint...' : 'Loading data...'}>
      <Header
        title="Raise Complaint"
        subtitle="Submit a new service or hardware request"
      />

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✅ {success}</Text>
          </View>
        ) : null}

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Location & Category</Text>

          <Select
            label="Department"
            value={departmentId}
            onValueChange={setDepartmentId}
            options={departments}
            placeholder="Select Department"
            required
          />

          <Select
            label="Block Name"
            value={blockId}
            onValueChange={setBlockId}
            options={blocks}
            placeholder={departmentId ? 'Select Block' : 'Select Department first'}
            disabled={!departmentId}
            required
          />

          <Select
            label="Room Number"
            value={roomId}
            onValueChange={setRoomId}
            options={rooms}
            placeholder={blockId ? 'Select Room' : 'Select Block first'}
            disabled={!blockId}
            required
          />

          {(roomId === '__manual__' || (blockId && rooms.length === 0)) && (
            <Input
              label="Enter Custom Room Number"
              value={customRoomNumber}
              onChangeText={setCustomRoomNumber}
              placeholder="e.g. Lab 101, Room A-2"
              required
            />
          )}

          <Select
            label="Complaint Type"
            value={complaintType}
            onValueChange={setComplaintType}
            options={COMPLAINT_TYPES.map(t => ({ label: t, value: t }))}
            required
          />

          <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>Details & Remarks</Text>

          <Input
            label="Remarks / Issue Description"
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Describe the issue, error, or work required..."
            multiline
            numberOfLines={4}
          />

          {/* Image / Attachment Upload */}
          <Text style={styles.label}>Attachment (Optional)</Text>
          <TouchableOpacity style={styles.pickerBtn} onPress={handlePickImage}>
            <Text style={styles.pickerBtnText}>
              📷 {attachment ? 'Change Image Attachment' : 'Select Photo / Screenshot'}
            </Text>
          </TouchableOpacity>

          {attachment ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: attachment.uri }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removeImgBtn} onPress={() => setAttachment(null)}>
                <Text style={styles.removeImgText}>Remove Attachment</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.buttonRow}>
            <Button
              title="Submit Complaint"
              onPress={handleSubmit}
              loading={submitting}
              style={styles.submitBtn}
            />
          </View>
        </View>
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
  successBox: {
    backgroundColor: COLORS.successBg,
    borderColor: COLORS.successBorder,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  successText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerBtn: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pickerBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    marginBottom: 8,
  },
  removeImgBtn: {
    paddingVertical: 4,
  },
  removeImgText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    marginTop: SPACING.md,
  },
  submitBtn: {
    width: '100%',
  },
});
