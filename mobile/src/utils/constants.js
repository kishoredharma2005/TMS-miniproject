import { Platform } from 'react-native';

// Host machine LAN IP address: 10.245.184.250
// This works on both Physical Android devices and Emulators over the local network.
// For Android emulator only, http://10.0.2.2:5000/api is also an alias.
export const DEFAULT_API_BASE_URL = 'http://10.245.184.250:5000/api';

export const COMPLAINT_TYPES = [
  'PC Hardware',
  'PC Software',
  'Application Issues',
  'Network',
  'Electronics',
  'Plumbing',
  'Other',
];

export const USER_ROLES = [
  'SuperAdmin',
  'User',
  'Networking Staff',
  'Plumber',
  'Electrician',
  'Software Developer',
  'Application',
  'PC Hardware',
];

export const TECHNICIAN_ROLES = [
  'Networking Staff',
  'Plumber',
  'Electrician',
  'Software Developer',
  'Application',
  'PC Hardware',
];

export const COMPLAINT_STATUSES = [
  'Pending',
  'Assigned',
  'In-Progress',
  'Onhold',
  'Closed',
];

export const STATUS_COLORS = {
  Pending: { bg: 'rgba(245, 158, 11, 0.15)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.4)' },
  Assigned: { bg: 'rgba(56, 189, 248, 0.15)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.4)' },
  'In-Progress': { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.4)' },
  Onhold: { bg: 'rgba(236, 72, 153, 0.15)', text: '#F472B6', border: 'rgba(236, 72, 153, 0.4)' },
  Closed: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34D399', border: 'rgba(16, 185, 129, 0.4)' },
};
